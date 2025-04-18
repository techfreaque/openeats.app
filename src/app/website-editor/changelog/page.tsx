"use client";

import { motion } from "framer-motion";
import { Book, Bug, InfoIcon, Star, Zap } from "lucide-react";
import { ScrollArea } from "next-vibe-ui/ui";
import type { JSX } from "react";
import { useEffect } from "react";

import type {
  Change,
  ChangeType,
  Version,
} from "@/lib/website-editor/changelogs";
import { commitChanges } from "@/lib/website-editor/changelogs";

import Header from "../components/header";

const ChangelogCards = ({
  commitChanges,
}: {
  commitChanges: Version[];
}): JSX.Element[] => {
  const groupChangesByType = (
    changes: Change[],
  ): Record<ChangeType, string[]> => {
    return changes.reduce(
      (acc, change) => {
        if (!acc[change.type]) {
          acc[change.type] = [];
        }
        acc[change.type].push(change.description);
        return acc;
      },
      {} as Record<ChangeType, string[]>,
    );
  };

  const getIcon = (type: ChangeType): JSX.Element => {
    switch (type) {
      case "feature":
        return (
          <Star className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        );
      case "improvement":
        return (
          <Zap className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        );
      case "bugfix":
        return (
          <Bug className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        );
      case "other":
        return (
          <Book className="h-5 w-5 mr-2 flex-shrink-0 text-gray-500 dark:text-gray-400" />
        );
    }
  };

  return commitChanges.map((release, index) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="mb-12 relative"
    >
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-700" />
      <div className="pl-8">
        <div className="flex items-center mb-4">
          <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 absolute -left-3" />
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {/* Version {release.version} */}
          </h2>
          <div className="ml-4 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm font-medium">
            {release.date}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
          {Object.entries(groupChangesByType(release.changes)).map(
            ([type, descriptions], typeIndex) => (
              <div key={typeIndex} className="mb-4 last:mb-0">
                <h3 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300 capitalize">
                  {type === "bugfix" ? "Bug Fixes" : `${type}s`}
                </h3>
                <ul className="space-y-2">
                  {descriptions.map((description, descIndex) => (
                    <motion.li
                      key={descIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: typeIndex * 0.1 + descIndex * 0.05,
                      }}
                      className="flex items-center"
                    >
                      {getIcon(type as ChangeType)}
                      <span className="text-gray-600 dark:text-gray-400">
                        {description}
                      </span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      </div>
    </motion.div>
  ));
};

export default function Changelog(): JSX.Element {
  useEffect(() => {
    localStorage.setItem("clv", new Date().toISOString());
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <div className="pt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto pb-5"
        >
          <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
            <div className="bg-yellow-50 p-2 rounded-md flex items-center space-x-2 text-yellow-800 my-5">
              <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                Changelogs below are generated by ai using commit messages from
                the repository.
              </p>
            </div>
            <ChangelogCards commitChanges={commitChanges} />
          </ScrollArea>
        </motion.div>
      </div>
    </div>
  );
}
