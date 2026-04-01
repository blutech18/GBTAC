"""
rate_limit.py

Configures the SlowAPI rate limiter instance used across all routers.
Limits are keyed by the client's remote IP address.

Author: Dominique Lee
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)