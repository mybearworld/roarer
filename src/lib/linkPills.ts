import { z } from "zod";

const GITHUB_ICON = {
  dark: "https://github.githubassets.com/favicons/favicon-dark.png",
  light: "https://github.githubassets.com/favicons/favicon.png",
};

const YOUTUBE_TEXT = async (match: RegExpMatchArray) => {
  const id = match[1];
  if (!id) {
    throw new Error("YouTube video has no ID");
  }
  try {
    const title = z
      .object({ title: z.string() })
      .parse(
        await (
          await fetch(
            `https://youtube.com/oembed?url=https://youtube.com/watch?v=${id}`,
          )
        ).json(),
      ).title;
    return title;
  } catch {
    return;
  }
};

export const linkPills: ExternalLink[] = [
  {
    base: "mybearworld.github.io",
    path: /^\/roarer#\/posts\/([a-z0-9\-]+)\/?$/,
    includeHash: true,
    icon: "https://mybearworld.github.io/roarer/bear.svg",
    name: "Roarer",
  },
  {
    base: "meo-32r.pages.dev",
    path: /^\/share\?id=([a-z0-9\-]+)\/?$/,
    includeSearch: true,
    icon: "https://mybearworld.github.io/roarer/bear.svg",
    name: "Roarer",
    convertLink: (match) => {
      const id = match[1];
      if (!id) throw new Error("ID not present in Meo post share");
      return `https://mybearworld.github.io/roarer#/posts/${id}`;
    },
  },
  {
    base: "scratch.mit.edu",
    path: /^\/users\/([a-zA-Z0-9_\-]+)\/?$/,
    icon: "https://scratch.mit.edu/favicon.ico",
    name: "Scratch",
  },
  {
    base: "scratch.mit.edu",
    path: /^\/projects\/(\d+)\/?$/,
    icon: "https://scratch.mit.edu/favicon.ico",
    name: "Scratch",
    text: async (match) => {
      const id = match[1];
      if (!id) {
        throw new Error("ID not given in Scratch project link");
      }
      const dom = new DOMParser().parseFromString(
        await (
          await fetch(`https://scratch.mit.edu/projects/${id}/remixtree`)
        ).text(),
        "text/html",
      );
      for (const script of dom.querySelectorAll("script")) {
        const match = script.innerHTML.match(/^      "title":(.*),$/m);
        if (!match) {
          continue;
        }
        const title = match[1];
        if (!title) {
          continue;
        }
        const parsed = JSON.parse(title);
        const element = document.createElement("div");
        element.innerHTML = parsed;
        return element.textContent!;
      }
      return undefined;
    },
  },
  {
    base: /^(?:www\.)?youtube\.com$/,
    path: /^\/@([a-zA-Z0-9_\-.]+)\/?$/,
    icon: "https://youtube.com/favicon.ico",
    name: "YouTube",
  },
  {
    base: /^(?:www\.)?youtube\.com$/,
    path: /^\/watch\?v=([a-zA-Z0-9_\-]+)$/,
    includeSearch: true,
    icon: "https://youtube.com/favicon.ico",
    name: "YouTube",
    text: YOUTUBE_TEXT,
  },
  {
    base: /^(?:www\.)?youtu\.be$/,
    path: /^\/([a-zA-Z0-9_\-]+)$/,
    icon: "https://youtube.com/favicon.ico",
    name: "YouTube",
    text: YOUTUBE_TEXT,
  },
  {
    base: "twitter.com",
    path: /^\/([a-zA-Z0-9_]+)\/?$/,
    icon: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg",
    name: "Twitter",
  },
  {
    base: "wasteof.money",
    path: /^\/users\/([a-zA-Z0-9\-_\.]+)\/?$/,
    icon: "https://wasteof.money/favicon.ico",
    name: "wasteof.money",
  },
  {
    base: "github.com",
    path: /^\/([a-zA-Z0-9\-]+)(?:\/([a-zA-Z0-9._\-]+)(?:\/commit\/([a-f0-9]+)|\/(?:issues|pull)\/(\d+))?)?\/?$/,
    icon: GITHUB_ICON,
    name: "GitHub",
    text: (match) => {
      const username = match[1];
      if (!username) {
        throw new Error("Username in GitHub link not present");
      }
      const repo = match[2];
      const commit = match[3]?.slice(0, 7);
      const issue = match[4];
      return repo
        ? commit
          ? [
              { sm: username },
              { sm: "/" },
              { sm: repo },
              { sm: "/" },
              { code: commit },
            ]
          : issue
            ? [
                { sm: username },
                { sm: "/" },
                { sm: repo },
                { sm: "/" },
                `#${issue}`,
              ]
            : [{ sm: username }, { sm: "/" }, repo]
        : username;
    },
  },
  {
    base: "github.com",
    path: /^\/([a-zA-Z0-9\-]+)\/([a-zA-Z0-9._\-]+)\/(tree|blob)((?:\/[^\/]+)+)\/?$/,
    icon: GITHUB_ICON,
    name: "GitHub",
    text: (match) => {
      const username = match[1];
      if (!username) {
        throw new Error("Username in GitHub path link not present");
      }
      const repo = match[2];
      if (!repo) {
        throw new Error("Repo in GitHub path link not present");
      }
      const path = match[4]?.split("/")?.slice(1);
      if (!path) {
        throw new Error("Path in GitHub path link not present");
      }
      return [
        { sm: username },
        { sm: "/" },
        { sm: repo },
        { sm: "/" },
        ...path
          .map((segment, i) => {
            if (i === path.length - 1) return segment;
            return [{ sm: segment }, { sm: "/" }];
          })
          .flat(),
      ];
    },
  },
];

export type ExternalLink = {
  base: string | RegExp;
  path: RegExp;
  includeSearch?: boolean;
  includeHash?: boolean;
  icon: string | { dark: string; light: string };
  name: string;
  text?: (
    match: RegExpMatchArray,
  ) => MaybePromise<
    undefined | string | (string | { sm: string } | { code: string })[]
  >;
  convertLink?: (match: RegExpMatchArray) => string;
};

type MaybePromise<T> = Promise<T> | T;
