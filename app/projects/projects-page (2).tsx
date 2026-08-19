"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/supabase";

type Project = {
  id: string;
  name: string;
  building: string | null;
  current_week: number | null;
  milestone: string | null;
  created_at: string;
};

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [building, setBuilding] = useState("");
  const [milestone, setMilestone] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const { data, error } = await db()
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProjects((data as Project[]) || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function add() {
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a project name.");
      return;
    }

    setLoading(true);

    try {
      const s = db();

      const {
        data: { user },
        error: userError,
      } = await s.auth.getUser();

      if (userError) {
        setMessage(userError.message);
        return;
      }

      if (!user) {
        setMessage("Sign in first.");
        return;
      }

      const { data: companyMembers, error: memberError } = await s
        .from("company_members")
        .select("company_id")
        .eq("user_id", user.id)
        .limit(1);

      if (memberError) {
        setMessage(memberError.message);
        return;
      }

      if (!companyMembers?.[0]?.company_id) {
        setMessage("Create a company first.");
        return;
      }

      const { error: projectError } = await s.from("projects").insert({
        company_id: companyMembers[0].company_id,
        name: name.trim(),
        building: building.trim() || null,
        current_week: 1,
        milestone: milestone.trim() || null,
      });

      if (projectError) {
        setMessage(projectError.message);
        return;
      }

      setName("");
      setBuilding("");
      setMilestone("");
      setMessage("");

      await load();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to create the project."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="eyebrow">Portfolio</div>

      <div className="h1">Projects</div>

      <div className="panel">
        <div className="h2">New Project</div>

        <div className="grid3">
          <div className="field">
            <label htmlFor="project-name">Name</label>
            <input
              id="project-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Project name"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="project-building">Building</label>
            <input
              id="project-building"
              type="text"
              value={building}
              onChange={(event) => setBuilding(event.target.value)}
              placeholder="Building"
              disabled={loading}
            />
          </div>

          <div className="field">
            <label htmlFor="project-milestone">Milestone</label>
            <input
              id="project-milestone"
              type="text"
              value={milestone}
              onChange={(event) => setMilestone(event.target.value)}
              placeholder="Milestone"
              disabled={loading}
            />
          </div>
        </div>

        <br />

        <button
          type="button"
          className="btn"
          onClick={add}
          disabled={loading}
        >
          {loading ? "Creating Project..." : "Create Project"}
        </button>

        {message && <div className="msg">{message}</div>}
      </div>

      <div className="panel">
        <div className="h2">Projects</div>

        <div className="tablewrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Building</th>
                <th>Week</th>
                <th>Milestone</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>{project.name}</td>
                  <td>{project.building || "—"}</td>
                  <td>W{project.current_week ?? 1}</td>
                  <td>{project.milestone || "—"}</td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td colSpan={4}>No projects yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
