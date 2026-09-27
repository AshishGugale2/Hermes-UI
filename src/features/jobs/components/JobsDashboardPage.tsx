import {
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import { mockJobs } from "../data/mock-jobs";
import type { JobPlatformFilter, JobRole } from "../types";

const platformFilters: JobPlatformFilter[] = [
  "All",
  "LinkedIn",
  "Wellfound",
  "Y Combinator",
  "Greenhouse",
  "Lever",
  "Company Site",
];

export function JobsDashboardPage() {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<JobPlatformFilter>("All");
  const [selectedId, setSelectedId] = useState(mockJobs[0]?.id ?? "");

  const filteredJobs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return mockJobs.filter((job) => {
      const matchesPlatform = platform === "All" || job.platform === platform;
      const searchable = [
        job.title,
        job.company,
        job.location,
        job.workMode,
        job.seniority,
        job.platform,
        ...job.requiredSkills,
        ...job.preferredSkills,
      ]
        .join(" ")
        .toLowerCase();

      return matchesPlatform && searchable.includes(normalizedQuery);
    });
  }, [platform, query]);

  const selectedJob =
    filteredJobs.find((job) => job.id === selectedId) ?? filteredJobs[0] ?? null;

  const openRoles = mockJobs.length;
  const remoteRoles = mockJobs.filter((job) => job.workMode === "Remote").length;
  const averageMatch = Math.round(
    mockJobs.reduce((total, job) => total + job.matchScore, 0) / mockJobs.length,
  );

  return (
    <main className="flex min-h-0 flex-1 flex-col bg-background">
      <section className="border-b px-5 py-4 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-normal">
              Open roles
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {openRoles} roles across {platformFilters.length - 1} platforms
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
            <Metric label="Open" value={openRoles.toString()} />
            <Metric label="Remote" value={remoteRoles.toString()} />
            <Metric label="Avg. match" value={`${averageMatch}%`} />
          </div>
        </div>
      </section>

      <section className="border-b px-5 py-3 md:px-6">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search roles, skills, companies"
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 xl:pb-0">
            <Filter className="size-4 shrink-0 text-muted-foreground" />
            {platformFilters.map((item) => (
              <Button
                key={item}
                type="button"
                variant={platform === item ? "default" : "outline"}
                size="sm"
                onClick={() => setPlatform(item)}
                className="shrink-0"
              >
                {item}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-h-0 overflow-y-auto p-4 md:p-5">
          <div className="grid gap-3">
            {filteredJobs.map((job) => (
              <JobRow
                key={job.id}
                job={job}
                selected={selectedJob?.id === job.id}
                onSelect={() => setSelectedId(job.id)}
              />
            ))}
            {filteredJobs.length === 0 && (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No roles match the current filters.
              </div>
            )}
          </div>
        </div>

        <aside className="min-h-0 border-t bg-muted/20 lg:border-l lg:border-t-0">
          {selectedJob ? <JobDetails job={selectedJob} /> : null}
        </aside>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card px-3 py-2">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function JobRow({
  job,
  selected,
  onSelect,
}: {
  job: JobRole;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-lg border bg-card p-4 text-left transition-colors hover:border-foreground/30 ${
        selected ? "border-foreground/50 shadow-sm" : ""
      }`}
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold">{job.title}</h2>
            <StatusPill>{job.platform}</StatusPill>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <InlineMeta icon={Building2} label={job.company} />
            <InlineMeta icon={MapPin} label={`${job.location} · ${job.workMode}`} />
            <InlineMeta icon={Clock3} label={job.postedAt} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Match</div>
            <div className="text-sm font-semibold">{job.matchScore}%</div>
          </div>
          <div className="h-9 w-1.5 rounded-full bg-primary/80" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {job.requiredSkills.slice(0, 5).map((skill) => (
          <SkillPill key={skill}>{skill}</SkillPill>
        ))}
      </div>
    </button>
  );
}

function JobDetails({ job }: { job: JobRole }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <StatusPill>{job.platform}</StatusPill>
            <h2 className="mt-3 text-xl font-semibold">{job.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{job.company}</p>
          </div>
          <Button asChild size="sm">
            <a href={job.link} target="_blank" rel="noreferrer">
              Link
              <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <DetailItem icon={MapPin} label="Location" value={`${job.location} · ${job.workMode}`} />
          <DetailItem icon={BriefcaseBusiness} label="Level" value={job.seniority} />
          <DetailItem icon={CheckCircle2} label="Match" value={`${job.matchScore}%`} />
          <DetailItem icon={Clock3} label="Posted" value={job.postedAt} />
        </div>

        <Separator className="my-5" />

        <section>
          <h3 className="text-sm font-semibold">Required skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.requiredSkills.map((skill) => (
              <SkillPill key={skill}>{skill}</SkillPill>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold">Preferred skills</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.preferredSkills.map((skill) => (
              <SkillPill key={skill} muted>
                {skill}
              </SkillPill>
            ))}
          </div>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold">Compensation</h3>
          <p className="mt-2 text-sm text-muted-foreground">{job.compensation}</p>
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold">Notes</h3>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {job.notes}
          </p>
        </section>
      </div>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-background p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}

function InlineMeta({
  icon: Icon,
  label,
}: {
  icon: typeof Building2;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}

function StatusPill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-md border bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
      {children}
    </span>
  );
}

function SkillPill({
  children,
  muted = false,
}: {
  children: string;
  muted?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs ${
        muted
          ? "border bg-background text-muted-foreground"
          : "bg-primary/10 text-primary"
      }`}
    >
      {children}
    </span>
  );
}
