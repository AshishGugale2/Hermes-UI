export type IpoRecord = {
  id: string;
  company: string;
  symbol: string;
  issuePrice: string;
  lotSize: string;
  subscription: string;
  openDate: string;
  closeDate: string;
  status: "Closing Today" | "Day 1" | "Day 2" | "Market Closed";
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

const addBusinessDays = (date: Date, days: number) => {
  const next = new Date(date);
  let remaining = Math.abs(days);

  while (remaining > 0) {
    next.setDate(next.getDate() + (days >= 0 ? 1 : -1));
    const day = next.getDay();
    if (day !== 0 && day !== 6) {
      remaining -= 1;
    }
  }

  return next;
};

export const getDummyIpoData = (): IpoRecord[] => {
  const today = new Date();
  const day1Close = addBusinessDays(today, 0);
  const day2Close = addBusinessDays(today, 1);
  const day3Close = addBusinessDays(today, 2);

  return [
    {
      id: "hermes-logistics",
      company: "Hermes Logistics",
      symbol: "HERMES",
      issuePrice: "₹420 - ₹440",
      lotSize: "40 Shares",
      subscription: "10.2x",
      openDate: formatDate(addBusinessDays(today, -2)),
      closeDate: formatDate(day1Close),
      status: "Closing Today",
    },
    {
      id: "apex-infra",
      company: "Apex Infra",
      symbol: "APEX",
      issuePrice: "₹210 - ₹230",
      lotSize: "60 Shares",
      subscription: "1.4x",
      openDate: formatDate(addBusinessDays(today, -1)),
      closeDate: formatDate(day2Close),
      status: "Day 1",
    },
    {
      id: "oak-digital",
      company: "Oak Digital",
      symbol: "OAKDIG",
      issuePrice: "₹320 - ₹350",
      lotSize: "50 Shares",
      subscription: "3.7x",
      openDate: formatDate(today),
      closeDate: formatDate(day3Close),
      status: "Day 2",
    },
  ];
};

export const getIpoMarketState = (date: Date) => {
  const day = date.getDay();
  const isClosed = day === 0 || day === 6;

  return {
    isClosed,
    label: isClosed ? "Market Closed" : "Market Open",
    note: isClosed
      ? "The market is closed today as it is a Saturday or Sunday. IPO bidding resumes on the next business day."
      : "Indian IPO subscription windows typically span 3 business days.",
  };
};

export const ipoApiSpec = {
  service: "IPO Dashboard API",
  method: "GET",
  endpoint: "/api/ipos",
  description:
    "Returns the IPO list and subscription timeline for the dashboard.",
  response: {
    status: "success",
    data: [
      {
        id: "string",
        company: "string",
        symbol: "string",
        issuePrice: "string",
        lotSize: "string",
        subscription: "string",
        openDate: "ISO date string",
        closeDate: "ISO date string",
        status: "Closing Today | Day 1 | Day 2 | Market Closed",
      },
    ],
  },
};
