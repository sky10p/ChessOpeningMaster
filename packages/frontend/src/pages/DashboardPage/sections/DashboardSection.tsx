import React, { useState } from "react";
import { IRepertoireDashboard } from "@chess-opening-master/common";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { MoveVariantNode } from "../../../models/VariantNode";

interface DashboardSectionProps {
  repertoires: IRepertoireDashboard[];
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ repertoires }) => {
  const [filter, setFilter] = useState<'all' | 'white' | 'black' | 'errors' | 'unreviewed'>('all');

  const invalidOrientationReps = repertoires.filter(r => r.orientation !== 'white' && r.orientation !== 'black');

  let filteredRepertoires = repertoires;
  if (filter === 'white') {
    filteredRepertoires = repertoires.filter(r => r.orientation === 'white');
  } else if (filter === 'black') {
    filteredRepertoires = repertoires.filter(r => r.orientation === 'black');
  } else if (filter === 'errors') {
    filteredRepertoires = repertoires.filter(r => (r.variantsInfo || []).some(info => (info.errors || 0) > 0));
  } else if (filter === 'unreviewed') {
    filteredRepertoires = repertoires.filter(r => {
      if (!r.moveNodes) return false;
      const variants = MoveVariantNode.initMoveVariantNode(r.moveNodes).getVariants();
      return variants.some(variant => {
        const info = (r.variantsInfo || []).find(i => i.variantName === variant.fullName);
        return !info || !info.lastDate;
      });
    });
  }

  const totalRepertoires = filteredRepertoires.length;

  const allVariants = filteredRepertoires.flatMap(rep => {
    if (!rep.moveNodes) return [];
    const variants = MoveVariantNode.initMoveVariantNode(rep.moveNodes).getVariants();
    if (filter === 'unreviewed') {
      return variants.filter(variant => {
        const info = (rep.variantsInfo || []).find(i => i.variantName === variant.fullName);
        return !info || !info.lastDate;
      });
    }
    return variants;
  });
  const totalVariants = allVariants.length;

  const errorsByOpeningMap: Record<string, number> = {};
  filteredRepertoires.forEach((rep) => {
    if (!rep.moveNodes) return;
    const variants = MoveVariantNode.initMoveVariantNode(rep.moveNodes).getVariants();
    const relevantVariants = filter === 'unreviewed'
      ? variants.filter(variant => {
          const info = (rep.variantsInfo || []).find(i => i.variantName === variant.fullName);
          return !info || !info.lastDate;
        })
      : variants;
    relevantVariants.forEach((variant) => {
      const info = (rep.variantsInfo || []).find(i => i.variantName === variant.fullName);
      if (info && info.errors && info.errors > 0) {
        errorsByOpeningMap[variant.name] = (errorsByOpeningMap[variant.name] || 0) + info.errors;
      }
    });
  });
  const errorsByOpening = Object.entries(errorsByOpeningMap)
    .map(([opening, errors]) => ({ opening, errors }))
    .sort((a, b) => b.errors - a.errors);
  const errorsByOpeningTop5 = errorsByOpening.slice(0, 5);

  const openingCount: Record<string, number> = {};
  allVariants.forEach((variant) => {
    openingCount[variant.name] = (openingCount[variant.name] || 0) + 1;
  });
  const openingPopularity = Object.entries(openingCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const mostRecent = filteredRepertoires.reduce((latest, rep) => {
    const lastDate = rep.variantsInfo && rep.variantsInfo[0]?.lastDate ? new Date(rep.variantsInfo[0].lastDate) : null;
    if (!lastDate) return latest;
    if (!latest || lastDate > latest.date) {
      return { name: rep.name, date: lastDate };
    }
    return latest;
  }, null as null | { name: string; date: Date });

  let neverReviewed = 0;
  let reviewedWithErrors = 0;
  let reviewedOK = 0;
  allVariants.forEach((variant) => {
    const rep = filteredRepertoires.find(r => r.moveNodes && MoveVariantNode.initMoveVariantNode(r.moveNodes).getVariants().some(v => v.fullName === variant.fullName));
    let info: { errors?: number; lastDate?: string | Date } | undefined = undefined;
    if (rep && rep.variantsInfo) {
      info = rep.variantsInfo.find(i => i.variantName === variant.fullName);
    }
    if (!info || !info.lastDate) {
      neverReviewed++;
    } else if (info.errors && info.errors > 0) {
      reviewedWithErrors++;
    } else {
      reviewedOK++;
    }
  });
  const reviewData = [
    { name: "Never Reviewed", value: neverReviewed },
    { name: "Reviewed With Errors", value: reviewedWithErrors },
    { name: "Reviewed OK", value: reviewedOK },
  ];

  const errorsDistribution: Record<number, number> = {};
  const reviewActivity: Record<string, number> = {};
  filteredRepertoires.forEach((rep) => {
    const variants = MoveVariantNode.initMoveVariantNode(rep.moveNodes || {}).getVariants?.() || [];
    const relevantVariants = filter === 'unreviewed'
      ? variants.filter(variant => {
          const info = (rep.variantsInfo || []).find(i => i.variantName === variant.fullName);
          return !info || !info.lastDate;
        })
      : variants;
    relevantVariants.forEach((variant) => {
      const info = (rep.variantsInfo || []).find(i => i.variantName === variant.fullName);
      const err = info?.errors || 0;
      errorsDistribution[err] = (errorsDistribution[err] || 0) + 1;
      if (info && info.lastDate) {
        const date = new Date(info.lastDate).toISOString().slice(0, 10);
        reviewActivity[date] = (reviewActivity[date] || 0) + 1;
      }
    });
  });
  const reviewActivityData = Object.entries(reviewActivity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  const today = new Date();
  const last10Days = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (9 - i));
    return d.toISOString().slice(0, 10);
  });
  const reviewActivityDataLast10 = last10Days.map(date => {
    const entry = reviewActivityData.find(d => d.date === date);
    return { date, count: entry ? entry.count : 0 };
  });
  const hasReviewActivity = reviewActivityDataLast10.some(d => d.count > 0);

  const COLORS = ["#f59e42", "#ef4444", "#22c55e"];

  return (
    <section className="flex-1 flex flex-col min-h-0 p-4">
      <header className="mb-4">
        <h2 className="font-bold text-gray-100 text-2xl leading-tight mb-1 truncate">Dashboard Overview</h2>
        <p className="text-gray-300 text-base leading-snug mb-2 truncate">Key statistics and metrics for your chess repertoires.</p>
        <div className="flex flex-wrap gap-2 mt-2 mb-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>All</button>
          <button onClick={() => setFilter('white')} className={`px-3 py-1 rounded ${filter === 'white' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>Only White</button>
          <button onClick={() => setFilter('black')} className={`px-3 py-1 rounded ${filter === 'black' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>Only Black</button>
          <button onClick={() => setFilter('errors')} className={`px-3 py-1 rounded ${filter === 'errors' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>Only Errors</button>
          <button onClick={() => setFilter('unreviewed')} className={`px-3 py-1 rounded ${filter === 'unreviewed' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'}`}>Only Unreviewed</button>
        </div>
        {invalidOrientationReps.length > 0 && (
          <div className="text-yellow-400 text-xs mb-2">
            Warning: {invalidOrientationReps.length} repertoire(s) have missing or invalid orientation and will only appear in "All".<br />
            <span className="block mt-1">Debug list:</span>
            <ul className="list-disc ml-4">
              {invalidOrientationReps.map(r => (
                <li key={r._id}>{r.name} (orientation: {String(r.orientation)})</li>
              ))}
            </ul>
          </div>
        )}
      </header>
      <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <span className="text-3xl font-bold text-blue-400">{totalRepertoires}</span>
            <span className="text-gray-300 mt-1">Total Repertoires</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <span className="text-3xl font-bold text-amber-400">{totalVariants}</span>
            <span className="text-gray-300 mt-1">Total Variants</span>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <span className="text-3xl font-bold text-purple-400">{mostRecent ? mostRecent.name : '-'}</span>
            <span className="text-gray-300 mt-1">Most Recently Updated</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full overflow-x-auto">
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Variants Review Status</h3>
            {reviewData.every(d => d.value === 0) ? (
              <div className="text-gray-400 text-center py-8">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={reviewData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {reviewData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Errors by Opening</h3>
            {errorsByOpeningTop5.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={errorsByOpeningTop5} layout="vertical" margin={{ top: 20, right: 30, left: 120, bottom: 20 }} barCategoryGap={24}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} label={{ value: 'Errors', position: 'insideBottomRight', offset: -5, fill: '#cbd5e1' }} />
                  <YAxis 
                    dataKey="opening" 
                    type="category" 
                    width={180} 
                    tick={({ x, y, payload }) => {
                      const name = payload.value;
                      const display = name.length > 28 ? name.slice(0, 25) + '…' : name;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={0}
                            dy={4}
                            textAnchor="end"
                            fill="#cbd5e1"
                            fontSize={13}
                          >
                            {display}
                            {name.length > 28 && <title>{name}</title>}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value} errors`, 'Errors']}
                    labelFormatter={(label: string) => `Opening: ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="errors" fill="#ef4444" name="Errors" radius={[6, 6, 6, 6]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Review Activity Over Time (7 days)</h3>
            {!hasReviewActivity ? (
              <div className="text-gray-400 text-center py-8">No review activity in the last 10 days</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={reviewActivityDataLast10} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Reviewed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="bg-gray-900 rounded-lg p-4 shadow border border-gray-800 flex flex-col items-center">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">
              {openingPopularity.length === 5 ? "Top 5 Openings Popularity" : "Top 10 Openings Popularity"}
            </h3>
            {openingPopularity.length === 0 ? (
              <div className="text-gray-400 text-center py-8">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={openingPopularity} margin={{ top: 40, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} height={70} tick={({ x, y, payload }) => {
                    const name = payload.value;
                    const display = name.length > 18 ? name.slice(0, 15) + '…' : name;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text
                          x={0}
                          y={0}
                          dy={16}
                          textAnchor="end"
                          fill="#cbd5e1"
                          fontSize={12}
                          transform="rotate(-30)"
                        >
                          {display}
                          {name.length > 18 && <title>{name}</title>}
                        </text>
                      </g>
                    );
                  }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} wrapperStyle={{ top: 0, left: 0, right: 0 }} />
                  <Bar dataKey="count" fill="#f59e42" name="Repertoires" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
