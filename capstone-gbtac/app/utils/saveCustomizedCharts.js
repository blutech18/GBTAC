import { db } from "../_utils/firebase";
import { collection, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";

/**
 * saveCustomDashboard
 *
 * Saves or updates a custom chart for a user in Firestore. Creates a new chart
 * document if no chartId is provided, or overwrites the existing document if one is.
 *
 * @param {string} userEmail - Firestore path key used to locate the user's charts subcollection
 * @param {string|null} chartId - ID of the chart to update, or null to create a new one
 * @param {object} settings - Chart display settings; settings.chartTitle is used as the document title field
 * @param {object} dateRange - Date range for the chart with from and to fields in YYYY-MM-DD format
 * @param {Array} selectedSensors - List of sensor objects to persist with the chart
 * @param {object} aggSettings - Aggregation settings; time defaults to "H" and type defaults to "mean" if absent
 *
 * @returns {string} The Firestore document ID of the saved or updated chart
 *
 * Notes:
 * - Updates use setDoc which fully overwrites the document — partial updates are not supported
 * - Updated documents receive an updatedAt timestamp; new documents receive a createdAt timestamp
 * - aggSettings fields are normalised before saving — missing time or type values are replaced
 *   with "H" and "mean" respectively rather than being stored as undefined
 * @author Temi Bankole
 */
export async function saveCustomDashboard({ userEmail, chartId, settings, dateRange, selectedSensors, aggSettings }) {
  const chartsRef = collection(db, "allowedUsers", userEmail, "charts");
  const normalizedAggSettings = {
    time: aggSettings?.time ?? "H",
    type: aggSettings?.type ?? "mean"
  };

  if (chartId) {
    await setDoc(doc(chartsRef, chartId), {
      title: settings.chartTitle,
      settings,
      dateRange,
      selectedSensors,
      aggSettings: normalizedAggSettings,
      updatedAt: serverTimestamp()
    });
    return chartId;
  }

  const docRef = await addDoc(chartsRef, {
    title: settings.chartTitle,
    settings,
    dateRange,
    selectedSensors,
    aggSettings: normalizedAggSettings,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}