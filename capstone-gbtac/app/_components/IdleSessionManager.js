"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../_utils/auth-context";
import ConfirmModal from "./ConfirmModal";

const IDLE_LIMIT_MS = 10 * 60 * 1000;        // 10 minutes
const WARNING_MS = 1 * 60 * 1000;            // Show warning in last 1 minute
const HEARTBEAT_INTERVAL_MS = 60 * 1000;     // Refresh once per minute while active

/**
 * IdleSessionManager
 *
 * Tracks authenticated user activity and automatically logs the user out after
 * a period of inactivity. It also shows a warning modal shortly before timeout
 * and sends periodic heartbeat refreshes to keep the sliding session alive while the user is active.
 *
 * Notes:
 * - Idle tracking is disabled on public routes where a session timeout warning is not relevant.
 * - Session refresh is throttled with a heartbeat interval so frequent user activity does not spam the backend.
 * - Logout is guarded with a ref to prevent duplicate logout calls from overlapping timers or failed refreshes.
 *
 * @returns The session timeout warning modal when the idle threshold is nearly reached, otherwise null
 *
 * @author Anna Isabelle Yabut
 */

export default function IdleSessionManager() {
    const { user, loading, logout, isAllowed, refreshSlidingSession } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const warningTimeoutRef = useRef(null);
    const logoutTimeoutRef = useRef(null);
    const countdownIntervalRef = useRef(null);
    const isLoggingOutRef = useRef(false);
    const lastHeartbeatRef = useRef(0);

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(WARNING_MS / 1000);

    // Public routes are excluded so the idle timer only runs for protected app areas
    const excludedRoutes = ["/", "/login", "/about-us"];

    const shouldTrackIdle =
        !loading &&
        !!user &&
        isAllowed &&
        !excludedRoutes.includes(pathname);

    // Centralized cleanup prevents multiple active timers from building up after repeated activity events
    const clearTimers = () => {
        if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
        if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current);
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };

    const handleAutoLogout = async () => {
        if (isLoggingOutRef.current) return;
        isLoggingOutRef.current = true;

        clearTimers();
        setShowWarning(false);

        try {
            await logout();
        } finally {
            router.replace("/");
        }
    };

    const startTimers = () => {
        clearTimers();
        setShowWarning(false);
        setCountdown(WARNING_MS / 1000);
        isLoggingOutRef.current = false;

        warningTimeoutRef.current = setTimeout(() => {
            setShowWarning(true);
        }, IDLE_LIMIT_MS - WARNING_MS);

        logoutTimeoutRef.current = setTimeout(() => {
            handleAutoLogout();
        }, IDLE_LIMIT_MS);
    };

    useEffect(() => {
        if (!shouldTrackIdle) {
            clearTimers();
            setShowWarning(false);
            return;
        }

        const resetActivityTimer = async () => {
            startTimers();

            const now = Date.now();

            // Heartbeat refresh is rate-limited so high-frequency events like mousemove do not trigger repeated session refreshes
            if (now - lastHeartbeatRef.current >= HEARTBEAT_INTERVAL_MS) {
                lastHeartbeatRef.current = now;
                const ok = await refreshSlidingSession();

                if (!ok) {
                    await handleAutoLogout();
                }
            }
            };

        const events = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "click",
        ];

        events.forEach((event) => {
            window.addEventListener(event, resetActivityTimer);
        });

        startTimers();

        return () => {
            clearTimers();
            events.forEach((event) => {
                window.removeEventListener(event, resetActivityTimer);
            });
        };
    }, [shouldTrackIdle, pathname]);

    useEffect(() => {
        if (!showWarning) return;

        countdownIntervalRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
            }
        };
    }, [showWarning]);

    const stayLoggedIn = () => {
        setShowWarning(false);
        startTimers();
    };

    if (!showWarning) return null;

    return (
        <ConfirmModal
            title="Session Timeout Warning"
            message={`You have been inactive for a while. You will be logged out in ${countdown} second(s) unless you continue your session.`}
            confirmText="Stay Logged In"
            cancelText="Logout"
            variant="primary"
            onConfirm={stayLoggedIn}
            onCancel={handleAutoLogout}
            disableBackdropClose={false}
        />
    );
}