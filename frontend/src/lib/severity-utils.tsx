"use client";

import { AlertTriangle, Info, Minus, Zap } from "lucide-react";

export const getSeverityIcon = (severity: string, size: string = "size-3") => {
  switch (severity) {
    case "Critical":
      return <Zap className={`${size} text-red-600 dark:text-red-400`} />;
    case "High":
      return <AlertTriangle className={`${size} text-orange-600 dark:text-orange-400`} />;
    case "Medium":
      return <Minus className={`${size} text-yellow-600 dark:text-yellow-400`} />;
    case "Low":
      return <Info className={`${size} text-blue-600 dark:text-blue-400`} />;
    default:
      return <Info className={`${size} text-gray-600 dark:text-gray-400`} />;
  }
};

export const getSeverityClasses = (severity: string): string => {
  switch (severity) {
    case "Critical":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800";
    case "High":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800";
    case "Low":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800";
  }
};

export const getMarkerColor = (severity: string): string => {
  switch (severity) {
    case "Critical":
      return "text-red-600";
    case "High":
      return "text-orange-600";
    case "Medium":
      return "text-yellow-600";
    case "Low":
      return "text-blue-600";
    default:
      return "text-gray-600";
  }
};