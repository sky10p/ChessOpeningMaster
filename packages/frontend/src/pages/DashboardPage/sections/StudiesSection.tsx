import React, { useState, useEffect } from "react";
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
} from "recharts";
import axios from "axios";

interface StudyGroup {
  id: string;
  name: string;
  studies: Study[];
}

interface Study {
  id: string;
  name: string;
  tags: string[];
  entries: { id: string; title: string }[];
  sessions: { id: string; duration: number }[];
}

export const StudiesSection: React.FC = () => {
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);

  useEffect(() => {
    const fetchStudies = async () => {
      const response = await axios.get("/studies");
      setStudyGroups(response.data);
    };
    fetchStudies();
  }, []);

  const totalStudies = studyGroups.reduce(
    (acc, group) => acc + group.studies.length,
    0
  );

  const totalSessions = studyGroups.reduce(
    (acc, group) =>
      acc +
      group.studies.reduce((studyAcc, study) => studyAcc + study.sessions.length, 0),
    0
  );

  const totalTimeSpent = studyGroups.reduce(
    (acc, group) =>
      acc +
      group.studies.reduce(
        (studyAcc, study) =>
          studyAcc + study.sessions.reduce((sessionAcc, session) => sessionAcc + session.duration, 0),
        0
      ),
    0
  );

  const studiesByGroup = studyGroups.map((group) => ({
    name: group.name,
    count: group.studies.length,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4">
      <header className="mb-4">
        <h2 className="font-bold text-gray-100 text-2xl leading-tight mb-1 truncate">
          Studies Overview
        </h2>
        <p className="text-gray-300 text-base leading-snug mb-2 truncate">
          Key statistics and metrics for your studies.
        </p>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-400">{totalStudies}</span>
          <span className="text-gray-300 mt-1">Total Studies</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-amber-400">{totalSessions}</span>
          <span className="text-gray-300 mt-1">Total Sessions</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <span className="text-3xl font-bold text-purple-400">
            {Math.floor(totalTimeSpent / 3600)}h {Math.floor((totalTimeSpent % 3600) / 60)}m
          </span>
          <span className="text-gray-300 mt-1">Total Time Spent</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-x-auto">
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Studies by Group
          </h3>
          {studiesByGroup.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={studiesByGroup} layout="vertical" barCategoryGap={24}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" name="Studies" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">
            Time Spent by Group
          </h3>
          {studyGroups.length === 0 ? (
            <div className="text-gray-400 text-center py-8">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={studyGroups.map((group) => ({
                    name: group.name,
                    value: group.studies.reduce(
                      (acc, study) =>
                        acc +
                        study.sessions.reduce((sessionAcc, session) => sessionAcc + session.duration, 0),
                      0
                    ),
                  }))}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  label
                >
                  {studyGroups.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
};