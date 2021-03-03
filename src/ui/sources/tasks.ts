import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { ICalendarSource, IDayMetadata } from "obsidian-calendar-ui";
import { getDailyNote, getWeeklyNote } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";

import { dailyNotes, weeklyNotes } from "../stores";

export async function getNumberOfTasks(note: TFile): Promise<[number, number]> {
  if (!note) {
    return [0, 0];
  }

  const { vault } = window.app;
  const fileContents = await vault.cachedRead(note);

  return [
    (fileContents.match(/(-|\*) \[ \] /g) || []).length,
    (fileContents.match(/(-|\*) \[x\] /gi) || []).length,
  ];
}

async function getMetadata(file: TFile): Promise<IDayMetadata> {
  const [numRemainingTasks, numCompletedTasks] = await getNumberOfTasks(file);
  const totalTasks = numRemainingTasks + numCompletedTasks;

  return {
    color: "#BF616A",
    goal: totalTasks,
    isShowcased: true,
    minDots: 0,
    maxDots: 1,
    name: "Tasks",
    value: numCompletedTasks,
    valueToDotRadio: 1,
  };
}

export const tasksSource: ICalendarSource = {
  getDailyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getDailyNote(date, get(dailyNotes));
    return getMetadata(file);
  },

  getWeeklyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getWeeklyNote(date, get(weeklyNotes));
    return getMetadata(file);
  },
};
