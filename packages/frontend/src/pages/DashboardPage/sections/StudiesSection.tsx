import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { fetchStudyGroups } from "../../../repository/studies/studies";
import { StudyGroup } from "../../StudiesPage/models";

// --- Helper Functions for Data Calculation ---

const calculateTotalStudies = (groups: StudyGroup[]): number => {
  return groups.reduce((acc, group) => acc + (group.studies?.length || 0), 0);
};

const calculateTotalSessions = (groups: StudyGroup[]): number => {
  return groups.reduce(
    (acc, group) =>
      acc +
      (group.studies?.reduce((studyAcc, study) => studyAcc + (study.sessions?.length || 0), 0) || 0),
    0
  );
};

const calculateTotalTimeSpentSeconds = (groups: StudyGroup[]): number => {
  return groups.reduce(
    (acc, group) =>
      acc +
      (group.studies?.reduce(
        (studyAcc, study) =>
          studyAcc +
          (study.sessions?.reduce((sessionAcc, session) => sessionAcc + session.duration, 0) || 0),
        0
      ) || 0),
    0
  );
};

interface StudyPracticeInfo {
  name: string;
  groupName: string;
  lastPracticed?: Date;
  daysSinceLastPractice: number;
}

const calculateStudiesWithoutPractice = (groups: StudyGroup[]): StudyPracticeInfo[] => {
  return groups.flatMap((group) =>
    group.studies?.map((study) => {
      if (!study.sessions || study.sessions.length === 0) {
        return {
          name: study.name,
          groupName: group.name,
          lastPracticed: undefined,
          daysSinceLastPractice: Infinity
        };
      }

      const lastSessionDate = study.sessions.reduce((latest, session) => {
        try {
          const sessionDate = new Date(session.start);
          if (!isNaN(sessionDate.getTime())) {
            return sessionDate > latest ? sessionDate : latest;
          }
        } catch (e) {
          console.error(`Invalid date format for session start: ${session.start}`, e);
        }
        return latest;
      }, new Date(0));

      const hasValidSessions = lastSessionDate.getTime() !== 0;

      return {
        name: study.name,
        groupName: group.name,
        lastPracticed: hasValidSessions ? lastSessionDate : undefined,
        daysSinceLastPractice: hasValidSessions
          ? Math.floor((new Date().getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24))
          : Infinity
      };
    }) || []
  ).sort((a, b) => b.daysSinceLastPractice - a.daysSinceLastPractice);
};

const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

const generateTimeframeLabels = (count: number, option: "week" | "month"): string[] => {
  const labels: string[] = [];
  const today = new Date();

  if (option === "week") {
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i * 7);
      labels.push(`W${getWeekNumber(date)}`);
    }
  } else {
    for (let i = count - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(today.getMonth() - i);
      labels.push(date.toLocaleString('default', { month: 'short' }));
    }
  }
  return labels;
};

type GroupTimeData = Record<string, Record<string, number>>;

const prepareSessionDataByGroupAndTimeframe = (
  groups: StudyGroup[],
  timeframeLabels: string[],
  timeframeOption: "week" | "month"
): GroupTimeData => {
  const groupTimeData: GroupTimeData = {};

  groups.forEach(group => {
    groupTimeData[group.name] = {};
    timeframeLabels.forEach(label => {
      groupTimeData[group.name][label] = 0;
    });

    group.studies?.forEach(study => {
      study.sessions?.forEach(session => {
        try {
          const sessionDate = new Date(session.start);
          if (isNaN(sessionDate.getTime())) throw new Error("Invalid date");

          const timeKey = timeframeOption === "week"
            ? `W${getWeekNumber(sessionDate)}`
            : sessionDate.toLocaleString('default', { month: 'short' });

          if (timeframeLabels.includes(timeKey)) {
            groupTimeData[group.name][timeKey] += session.duration;
          }
        } catch (error) {
          console.error(`Error processing session for study '${study.name}':`, error);
        }
      });
    });
  });

  return groupTimeData;
};

interface StackedChartDataPoint {
  timeLabel: string;
  [groupName: string]: string | number;
}

const transformDataForStackedBarChart = (
  timeframeLabels: string[],
  groups: StudyGroup[],
  groupTimeData: GroupTimeData
): StackedChartDataPoint[] => {
  return timeframeLabels.map(timeLabel => {
    const dataPoint: StackedChartDataPoint = { timeLabel };
    groups.forEach(group => {
      dataPoint[group.name] = ((groupTimeData[group.name]?.[timeLabel] || 0) / 60).toFixed(1);
    });
    return dataPoint;
  });
};

interface TimeframeAreaDataPoint {
  timeLabel: string;
  duration: number;
}

const prepareTimeframeAreaData = (
  timeframeLabels: string[],
  groupTimeData: GroupTimeData,
  groups: StudyGroup[]
): TimeframeAreaDataPoint[] => {
  const totalDurationByTimeframe: Record<string, number> = {};
  timeframeLabels.forEach(label => { totalDurationByTimeframe[label] = 0; });

  groups.forEach(group => {
    timeframeLabels.forEach(label => {
      totalDurationByTimeframe[label] += (groupTimeData[group.name]?.[label] || 0);
    });
  });

  return timeframeLabels.map(timeLabel => ({
    timeLabel,
    duration: (totalDurationByTimeframe[timeLabel] || 0) / 60
  }));
};

interface GroupTimePieDataPoint {
  name: string;
  value: number;
}

const calculateTimeByGroupForPieChart = (groups: StudyGroup[]): GroupTimePieDataPoint[] => {
  return groups.map((group) => {
    const totalDurationSeconds = group.studies?.reduce(
      (studyAcc, study) =>
        studyAcc +
        (study.sessions?.reduce((sessionAcc, session) => sessionAcc + session.duration, 0) || 0),
      0
    ) || 0;

    return {
      name: group.name,
      value: totalDurationSeconds / 60,
    };
  }).filter(group => group.value > 0);
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#83a6ed"];

// --- Component --- 

export const StudiesSection: React.FC = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [timeframeOption, setTimeframeOption] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudies = async () => {
      try {
        setLoading(true);
        const data = await fetchStudyGroups();
        setStudyGroups(data);
      } catch (error) {
        console.error("Error fetching study groups:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudies();
  }, []);

  const totalStudies = useMemo(() => calculateTotalStudies(studyGroups), [studyGroups]);
  const totalSessions = useMemo(() => calculateTotalSessions(studyGroups), [studyGroups]);
  const totalTimeSpentSeconds = useMemo(() => calculateTotalTimeSpentSeconds(studyGroups), [studyGroups]);

  const studiesWithoutPractice = useMemo(() => calculateStudiesWithoutPractice(studyGroups), [studyGroups]);

  const timeframeLabels = useMemo(() => generateTimeframeLabels(8, timeframeOption), [timeframeOption]);

  const groupTimeData = useMemo(() => 
    prepareSessionDataByGroupAndTimeframe(studyGroups, timeframeLabels, timeframeOption), 
    [studyGroups, timeframeLabels, timeframeOption]
  );

  const stackedBarChartData = useMemo(() => 
    transformDataForStackedBarChart(timeframeLabels, studyGroups, groupTimeData), 
    [timeframeLabels, studyGroups, groupTimeData]
  );

  const areaChartData = useMemo(() => 
    prepareTimeframeAreaData(timeframeLabels, groupTimeData, studyGroups), 
    [timeframeLabels, groupTimeData, studyGroups]
  );

  const pieChartData = useMemo(() => calculateTimeByGroupForPieChart(studyGroups), [studyGroups]);

  if (loading) {
    return (
      <section className="flex-1 flex flex-col min-h-0 p-4">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-300 text-xl">Loading study data...</p>
        </div>
      </section>
    );
  }

  const hasAreaChartData = areaChartData.some(d => d.duration > 0);
  const hasPieChartData = pieChartData.length > 0;
  const hasStackedBarData = stackedBarChartData.some(d => 
    Object.entries(d).some(([k, v]) => k !== 'timeLabel' && Number(v) > 0)
  );
  const hasStudiesWithoutPractice = studiesWithoutPractice.length > 0;

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4">
      <header className="mb-4">
        <h2 className="font-bold text-gray-100 text-2xl leading-tight mb-1 truncate">
          Studies Overview
        </h2>
        <p className="text-gray-300 text-base leading-snug mb-2 truncate">
          Key statistics and metrics for your chess studies.
        </p>
      </header>
      
      <div style={{ maxHeight: "calc(100vh - 180px)", overflowY: "auto" }} className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-400">{totalStudies}</span>
            <span className="text-gray-300 mt-1">Total Studies</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 flex flex-col items-center">
            <span className="text-3xl font-bold text-amber-400">{totalSessions}</span>
            <span className="text-gray-300 mt-1">Total Sessions</span>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700 flex flex-col items-center">
            <span className="text-3xl font-bold text-purple-400">
              {Math.floor(totalTimeSpentSeconds / 3600)}h {Math.floor((totalTimeSpentSeconds % 3600) / 60)}m
            </span>
            <span className="text-gray-300 mt-1">Total Time Spent</span>
          </div>
        </div>

        <div className="flex justify-end mb-4">
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 ${timeframeOption === "week" ? "bg-blue-700" : ""}`}
              onClick={() => setTimeframeOption("week")}
            >
              Weekly
            </button>
            <button
              className={`px-4 py-2 ${timeframeOption === "month" ? "bg-blue-700" : ""}`}
              onClick={() => setTimeframeOption("month")}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-6">
          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-2 text-center">
              Time Spent by {timeframeOption === "week" ? "Week" : "Month"}
            </h3>
            {!hasAreaChartData ? (
              <div className="text-gray-400 text-center py-16">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={areaChartData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeLabel" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} min`, 'Time Spent']} />
                  <Area 
                    type="monotone" 
                    dataKey="duration" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.6} 
                    name="Time Spent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-2 text-center">
              Time Distribution by Group
            </h3>
            {!hasPieChartData ? (
              <div className="text-gray-400 text-center py-16">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    label={(entry) => `${entry.name}: ${Math.round(entry.value)} min`}
                    labelLine={false}
                  >
                    {pieChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} minutes`, 'Time Spent']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-2 text-center">
              Time by Group per {timeframeOption === "week" ? "Week" : "Month"}
            </h3>
            {!hasStackedBarData ? (
              <div className="text-gray-400 text-center py-16">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stackedBarChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timeLabel" />
                  <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  {studyGroups.map((group, index) => (
                    <Bar key={group.id} dataKey={group.name} stackId="a" fill={COLORS[index % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg p-4 shadow border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-2 text-center">
              Studies Without Recent Practice
            </h3>
            {!hasStudiesWithoutPractice ? (
              <div className="text-gray-400 text-center py-16">No data available</div>
            ) : (
              <div className="overflow-auto h-[300px]">
                <table className="min-w-full text-gray-200">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="py-2 px-4 text-left">Study</th>
                      <th className="py-2 px-4 text-left">Group</th>
                      <th className="py-2 px-4 text-right">Last Practice</th>
                      <th className="py-2 px-4 text-right">Days Since</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studiesWithoutPractice.slice(0, 10).map((study, index) => (
                      <tr key={`${study.groupName}-${study.name}-${index}`} className="border-t border-gray-700">
                        <td className="py-2 px-4">{study.name}</td>
                        <td className="py-2 px-4">{study.groupName}</td>
                        <td className="py-2 px-4 text-right">
                          {study.lastPracticed ? study.lastPracticed.toLocaleDateString() : 'Never'}
                        </td>
                        <td className={`py-2 px-4 text-right ${study.daysSinceLastPractice > 30 ? 'text-red-400' : 'text-yellow-400'}`}>
                          {study.daysSinceLastPractice === Infinity ? '—' : `${study.daysSinceLastPractice} days`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};