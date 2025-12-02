import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
} from 'recharts';
import { MessageSquare, Users, Smile, Link as LinkIcon, Clock, Calendar } from 'lucide-react';
import ReactWordcloud from 'react-wordcloud';

// Helper to resolve favicons, with special handling for TikTok
const getFaviconUrl = (domain) => {
    const d = (domain || '').toLowerCase();
    if (d.endsWith('tiktok.com') || d.includes('tiktok')) {
        // Use TikTok's official favicon so subdomains like vk.tiktok.com work
        return 'https://www.tiktok.com/favicon.ico';
    }
    return `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
};

// High Contrast Colors (from CSS variables in colors.css)
const COLORS = [
    'var(--chart-user-1)',
    'var(--chart-user-2)',
    'var(--chart-user-3)',
    'var(--chart-user-4)',
    'var(--chart-user-5)',
    'var(--chart-user-6)',
    'var(--chart-user-7)',
    'var(--chart-user-8)',
];

const StatCard = ({ title, value, icon: Icon, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="glass-panel p-6 flex items-center justify-between"
    >
        <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-full text-primary">
            <Icon className="w-6 h-6" />
        </div>
    </motion.div>
);

const Dashboard = ({ data }) => {
    if (!data) return null;

    try {
        const {
            sentiment_by_person = [],
            hourly_activity = [],
            total_messages = 0,
            participants = [],
            emoji_stats = {},
            word_clouds = [],
            domain_stats = [],
            conversation_initiation = [],
            total_duration = "N/A",
            avg_messages_per_day = 0
        } = data;

        const overallSentiment = sentiment_by_person.length > 0 
            ? sentiment_by_person.reduce((acc, curr) => acc + (curr.average_sentiment || 0), 0) / sentiment_by_person.length 
            : 0;

    const wordCloudOptions = {
        rotations: 2,
        rotationAngles: [-90, 0],
        fontSizes: [12, 60],
    };

        return (
            <div className="w-full max-w-7xl mx-auto p-6 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Messages" value={total_messages.toLocaleString()} icon={MessageSquare} delay={0.1} />
                <StatCard title="Participants" value={participants.length} icon={Users} delay={0.2} />
                <StatCard title="Time Period" value={total_duration} icon={Calendar} delay={0.3} />
                <StatCard title="Avg Messages/Day" value={avg_messages_per_day} icon={MessageSquare} delay={0.4} />
            </div>

            {/* Row 1: Sentiment & Response Time */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Avg Message Length (Swapped) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="glass-panel p-6"
                >
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">Avg Message Length (Words)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentiment_by_person} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="author" type="category" width={100} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar
                                    dataKey="avg_message_length"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                >
                                    {(sentiment_by_person || []).map((entry) => (
                                        <Cell
                                            key={entry.author}
                                            fill={
                                                COLORS[
                                                    participants.indexOf(entry.author) %
                                                    COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Avg Response Time */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                    className="glass-panel p-6"
                >
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">Avg Response Time (Minutes)</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentiment_by_person} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" />
                                <YAxis dataKey="author" type="category" width={100} />
                                <Tooltip cursor={{ fill: 'transparent' }} formatter={(value) => `${value.toFixed(1)} min`} />
                                <Bar
                                    dataKey="avg_response_time_minutes"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                >
                                    {(sentiment_by_person || []).map((entry) => (
                                        <Cell
                                            key={entry.author}
                                            fill={
                                                COLORS[
                                                    participants.indexOf(entry.author) %
                                                    COLORS.length
                                                ]
                                            }
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Row 2: Hourly Activity (Multi-User, Non-Cumulative, High Contrast) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="glass-panel p-6"
            >
                <h3 className="text-lg font-semibold mb-6 text-gray-800">Hourly Activity by User (24h)</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourly_activity}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                            <YAxis />
                            <Tooltip labelFormatter={(h) => `${h}:00`} />
                            <Legend />
                            {(participants || []).map((person, index) => (
                                <Area
                                    key={person || `user-${index}`}
                                    type="monotone"
                                    dataKey={person}
                                    stroke={COLORS[index % COLORS.length]}
                                    fill={COLORS[index % COLORS.length]}
                                    fillOpacity={0.1}
                                    strokeWidth={3}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Row 2.5: Conversation Initiation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
                className="glass-panel p-6"
            >
                <h3 className="text-lg font-semibold mb-6 text-gray-800">Conversation Initiation</h3>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={conversation_initiation || []} layout="vertical" margin={{ left: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="author" type="category" width={100} />
                            <Tooltip cursor={{ fill: 'transparent' }} />
                            <Legend />
                            <Bar
                                dataKey="conversations_started"
                                name="Conversations Started"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                            >
                                {(conversation_initiation || []).map((entry) => (
                                    <Cell
                                        key={entry.author}
                                        fill={
                                            COLORS[
                                                participants.indexOf(entry.author) %
                                                COLORS.length
                                            ]
                                        }
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Row 3: Message Length & User Emojis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sentiment Distribution (Swapped) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 }}
                    className="glass-panel p-6"
                >
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">Sentiment Distribution</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sentiment_by_person} layout="vertical" margin={{ left: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 100]} unit="%" tickFormatter={(val) => Math.round(val)} />
                                <YAxis dataKey="author" type="category" width={100} />
                                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar
                                    dataKey="positive_pct"
                                    name="Positive"
                                    stackId="a"
                                    fill="var(--chart-sentiment-positive)"
                                />
                                <Bar
                                    dataKey="neutral_pct"
                                    name="Neutral"
                                    stackId="a"
                                    fill="var(--chart-sentiment-neutral)"
                                />
                                <Bar
                                    dataKey="negative_pct"
                                    name="Negative"
                                    stackId="a"
                                    fill="var(--chart-sentiment-negative)"
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* User Top Emojis */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 }}
                    className="glass-panel p-6"
                >
                    <h3 className="text-lg font-semibold mb-6 text-gray-800">User's Favorite Emojis</h3>
                    <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
                        {emoji_stats?.by_person?.map((person, idx) => (
                            <div key={idx}>
                                <h4 className="text-sm font-medium text-gray-500 mb-2">{person.author}</h4>
                                <div className="flex gap-4">
                                    {(person.top_emojis || []).map((e, i) => (
                                        <div key={i} className="flex flex-col items-center bg-gray-50 p-2 rounded min-w-[60px]">
                                            <span className="text-2xl mb-1">{e.emoji}</span>
                                            <span className="text-xs font-bold text-gray-600">{e.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Row 4: Word Clouds */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.0 }}
                className="glass-panel p-6"
            >
                <h3 className="text-lg font-semibold mb-6 text-gray-800">Word Clouds</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {word_clouds?.map((userCloud, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[Math.max(0, participants.indexOf(userCloud.author)) % COLORS.length] }}
                                />
                                <h4 className="font-bold text-gray-800 truncate">{userCloud.author}</h4>
                            </div>
                            <div className="h-[200px] overflow-hidden">
                                {userCloud.words.length > 0 ? (
                                    <ReactWordcloud
                                        words={userCloud.words}
                                        options={{
                                            ...wordCloudOptions,
                                            fontSizes: [10, 40], // Smaller font sizes for smaller cards
                                        }}
                                    />
                                ) : (
                                    <div className="h-full flex items-center justify-center text-gray-400 text-sm">No data</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {word_clouds?.length === 0 && (
                        <div className="text-center text-gray-400 py-8 col-span-full">No word cloud data found</div>
                    )}
                </div>
            </motion.div>

            {/* Row 5: Top Domains (Per User) */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 }}
                className="glass-panel p-6"
            >
                <h3 className="text-lg font-semibold mb-6 text-gray-800">Top Shared Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {domain_stats?.map((person, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: COLORS[Math.max(0, participants.indexOf(person.author)) % COLORS.length] }}
                                />
                                <h4 className="font-bold text-gray-800 truncate">{person.author}</h4>
                            </div>
                            <div className="space-y-2">
                                {person.domains?.map((item, i) => (
                                    item?.domain ? (
                                        <div
                                            key={i}
                                            className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 hover:border-gray-300 transition-colors"
                                            title={item.domain}
                                        >
                                            <div className="flex items-center gap-2 max-w-[180px]">
                                                <img
                                                    src={getFaviconUrl(item.domain)}
                                                    alt={item.domain || 'Link'}
                                                    className="w-5 h-5 rounded flex-shrink-0"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                                <span className="text-xs text-gray-600 truncate" title={item.domain}>
                                                    {item.domain}
                                                </span>
                                            </div>
                                            <span className="text-xs font-bold bg-gray-100 px-2 py-0.5 rounded-full text-gray-700">
                                                {item.count || 0}
                                            </span>
                                        </div>
                                    ) : null
                                ))}
                                {person.domains.length === 0 && (
                                    <div className="text-xs text-gray-400 italic text-center py-2">No links</div>
                                )}
                            </div>
                        </div>
                    ))}
                    {domain_stats?.length === 0 && (
                        <div className="text-center text-gray-400 py-8 col-span-full">No links found</div>
                    )}
                </div>
            </motion.div>
        </div>
    );
    } catch (error) {
        console.error('Dashboard error:', error);
        return (
            <div className="w-full max-w-7xl mx-auto p-6">
                <div className="glass-panel p-8 text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
                    <p className="text-gray-600 mb-4">{error.message}</p>
                    <p className="text-sm text-gray-500">Please check the browser console for details.</p>
                </div>
            </div>
        );
    }
};

export default Dashboard;
