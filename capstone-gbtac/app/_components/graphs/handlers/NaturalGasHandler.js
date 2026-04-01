"use client";

import { useEffect, useMemo, useState } from "react";
import BarChart from "../BarChart";
import LineChart from "../LineChart";
import ExportPDFButton from "@/app/_components/ExportPDFButton";

export default function NaturalGasHandler({
  startDate,
  endDate,
  unit = "kWh",
  aggregation = "none",
  onStatsReady,
  chartRef,
  chartRef2,
}) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canFetch = startDate && endDate;

  useEffect(() => {
    if (!canFetch) {
      setRows([]);
      setError("");
      setLoading(false);
      onStatsReady?.(null);
      return;
    }

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/energy/total/30000_TL342?start=${startDate}&end=${endDate}`,
            { credentials: "include" }
            );

            if (!res.ok) {
            throw new Error("Failed to fetch natural gas dashboard data");
            }

            const data = await res.json();
            const safeRows = Array.isArray(data) ? data : [];
            setRows(safeRows);
            
        } catch (err) {
            console.error(err);
            setError("Could not load natural gas dashboard data.");
            setRows([]);
            onStatsReady?.(null);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, [startDate, endDate, canFetch, onStatsReady]);

    const groupedRows = useMemo(() => {
        if (aggregation !== "Y") return rows;

        return Object.values(
        rows.reduce((acc, row) => {
            const year = row.month.slice(0, 4);

            if (!acc[year]) {
            acc[year] = {
                month: year,
                natural_gas_kwh: 0,
                electricity_kwh: 0,
                total_energy_kwh: 0,
            };
            }

            acc[year].natural_gas_kwh += row.natural_gas_kwh || 0;
            acc[year].electricity_kwh += row.electricity_kwh || 0;
            acc[year].total_energy_kwh += row.total_energy_kwh || 0;

            return acc;
        }, {})
        );
    }, [rows, aggregation]);

        useEffect(() => {
            const statsSource = aggregation === "Y" ? groupedRows : rows;

            if (!statsSource || statsSource.length === 0) {
                onStatsReady?.(null);
                return;
            }

            const totalEnergy = statsSource.reduce(
                (sum, item) => sum + (item.total_energy_kwh || 0),
                0
            );

            const avgGas =
                statsSource.reduce((sum, item) => sum + (item.natural_gas_kwh || 0), 0) /
                statsSource.length;

            const avgElectricity =
                statsSource.reduce((sum, item) => sum + (item.electricity_kwh || 0), 0) /
                statsSource.length;

            const peakPeriod = statsSource.reduce((max, item) =>
                (item.total_energy_kwh || 0) > (max.total_energy_kwh || 0) ? item : max
            );

            onStatsReady?.({
                totalEnergy,
                avgGas,
                avgElectricity,
                peakMonth: peakPeriod ? peakPeriod.month : "N/A",
            });
    }, [rows, groupedRows, aggregation, onStatsReady]);

    const convertedRows = useMemo(
        () =>
        groupedRows.map((row) => ({
            ...row,
            naturalGas:
            unit === "W"
                ? (row.natural_gas_kwh || 0) * 1000
                : row.natural_gas_kwh || 0,
            electricity:
            unit === "W"
                ? (row.electricity_kwh || 0) * 1000
                : row.electricity_kwh || 0,
            total:
            unit === "W"
                ? (row.total_energy_kwh || 0) * 1000
                : row.total_energy_kwh || 0,
        })),
        [groupedRows, unit]
    );

    const getNiceStep = (maxValue) => {
        if (maxValue <= 1000) return 100;
        if (maxValue <= 10000) return 1000;
        if (maxValue <= 100000) return 10000;
        if (maxValue <= 1000000) return 50000;
        return 100000;
    };

    // Bar chart scale
    const rawBarMax = Math.max(
        ...convertedRows.map((row) => row.naturalGas + row.electricity),
        0
    );
    const barStep = getNiceStep(rawBarMax);
    const barMax = Math.ceil(rawBarMax / barStep) * barStep || barStep;

    // Line chart scale
    const rawLineMax = Math.max(...convertedRows.map((row) => row.total), 0);
    const paddedLineMax = rawLineMax * 1.1;
    const lineStep = getNiceStep(paddedLineMax);
    const lineMax = Math.ceil(paddedLineMax / lineStep) * lineStep || lineStep;

    const formatMonth = (value) => {
        if (!value) return "";

        if (aggregation === "Y") {
            return value; // just 2023, 2024, 2025
        }

        const [year, month] = value.split("-");

        const monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        return `${monthNames[Number(month) - 1]} ${year}`;
    };


  const stackedBarData = {
    labels: convertedRows.map((row) => formatMonth(row.month)),
    datasets: [
      {
        label: "Natural Gas",
        data: convertedRows.map((row) => row.naturalGas),
        backgroundColor: "#E62B1E",
        borderColor: "#E62B1E",
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        maxBarThickness: 80,
      },
      {
        label: "GBT Site Consumption",
        data: convertedRows.map((row) => row.electricity),
        backgroundColor: "#005EB8",
        borderColor: "#005EB8",
        borderWidth: 1,
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        maxBarThickness: 80,
      },
    ],
  };

  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 14,
          padding: 16,
        },
      },
      title: {
        display: true,
        text:
          aggregation === "Y"
            ? `Yearly Energy Breakdown, ${startDate} to ${endDate}`
            : `Monthly Energy Breakdown, ${startDate} to ${endDate}`,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: aggregation === "Y" ? "Year" : "Month",
        },
        ticks: {
          autoSkip: false,
        },
        grid: {
          display: false,
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: barMax,
        ticks: {
          stepSize: barStep,
        },
        title: {
          display: true,
          text: unit,
        },
      },
    },
  };

  const lineChartData = {
    datasets: [
      {
        label: "Total Energy Consumption",
        data: convertedRows.map((row) => ({
          x:
            aggregation === "Y"
              ? new Date(`${row.month}-01-01`)
              : new Date(`${row.month}-01`),
          y: row.total,
        })),
        borderColor: "#6D2077",
        backgroundColor: "#6D2077",
        borderWidth: 3,
        tension: 0.25,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          boxWidth: 14,
          padding: 16,
        },
      },
      title: {
        display: true,
        text:
          aggregation === "Y"
            ? `Yearly Total Energy Consumption, ${startDate} to ${endDate}`
            : `Total Energy Consumption Trend, ${startDate} to ${endDate}`,
        font: {
          size: 16,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: aggregation === "Y" ? "year" : "month",
          displayFormats: {
            year: "yyyy",
            month: "MMM yyyy",
          },
        },
        title: {
          display: true,
          text: aggregation === "Y" ? "Year" : "Month",
        },
      },
      y: {
        beginAtZero: true,
        max: lineMax,
        ticks: {
          stepSize: lineStep,
        },
        title: {
          display: true,
          text: unit,
        },
      },
    },
  };

  const LoadingOverlay = ({ text }) => (
    <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10 rounded">
      <div className="flex flex-col items-center gap-2 text-gray-600">
        <svg
          className="animate-spin h-8 w-8 text-[#6D2077]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <span className="text-sm font-medium">{text}</span>
      </div>
    </div>
  );

  const EmptyState = ({ text }) => (
    <div className="h-full flex items-center justify-center text-gray-400 text-sm">
      {text}
    </div>
  );

    return (
        <>
            <div
                ref={chartRef}
                className="bg-white rounded-lg shadow-md p-4 mt-6"
            >
            <div className="relative min-h-75">
                {loading ? (
                <LoadingOverlay text="Loading data..." />
                ) : error ? (
                <div className="h-full flex items-center justify-center text-red-500 text-sm">
                    {error}
                </div>
                ) : convertedRows.length === 0 ? (
                <EmptyState text="No data available for the selected date range." />
                ) : (
                <BarChart data={stackedBarData} options={stackedBarOptions} />
                )}
            </div>
            </div>

                <div className="flex justify-end mt-2 pr-1">
                    <ExportPDFButton
                        chartRef={chartRef}
                        fileName="natural-gas-chart"
                    />
                </div>

                <div
                    ref={chartRef2}
                    className="bg-white rounded-lg shadow-md p-4 mt-6"
                >
                <div className="relative min-h-75">
                    {loading ? (
                    <LoadingOverlay text="Loading data..." />
                    ) : error ? (
                    <div className="h-full flex items-center justify-center text-red-500 text-sm">
                        {error}
                    </div>
                    ) : convertedRows.length === 0 ? (
                    <EmptyState text="No data available for the selected date range." />
                    ) : (
                    <LineChart data={lineChartData} options={lineChartOptions} />
                    )}
                </div>
            </div>

            <div className="flex justify-end mt-2 pr-1">
                <ExportPDFButton
                    chartRef={chartRef2}
                    fileName="natural-gas-chart-2"
                />
            </div>
        </>
    );
}