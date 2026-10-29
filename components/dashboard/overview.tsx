"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    "Total Reviews": 157,
    "Flagged Reviews": 18,
  },
  {
    name: "Feb",
    "Total Reviews": 142,
    "Flagged Reviews": 15,
  },
  {
    name: "Mar",
    "Total Reviews": 185,
    "Flagged Reviews": 21,
  },
  {
    name: "Apr",
    "Total Reviews": 203,
    "Flagged Reviews": 25,
  },
  {
    name: "May",
    "Total Reviews": 178,
    "Flagged Reviews": 19,
  },
  {
    name: "Jun",
    "Total Reviews": 195,
    "Flagged Reviews": 22,
  },
  {
    name: "Jul",
    "Total Reviews": 210,
    "Flagged Reviews": 24,
  },
  {
    name: "Aug",
    "Total Reviews": 228,
    "Flagged Reviews": 27,
  },
  {
    name: "Sep",
    "Total Reviews": 245,
    "Flagged Reviews": 29,
  },
  {
    name: "Oct",
    "Total Reviews": 260,
    "Flagged Reviews": 31,
  },
  {
    name: "Nov",
    "Total Reviews": 275,
    "Flagged Reviews": 33,
  },
  {
    name: "Dec",
    "Total Reviews": 290,
    "Flagged Reviews": 35,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="Total Reviews" fill="#adfa1d" radius={[4, 4, 0, 0]} />
        <Bar dataKey="Flagged Reviews" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
