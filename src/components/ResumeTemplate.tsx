import React, { useState } from "react";
import { ResumeData, TemplateType } from "../types";
import { Mail, Phone, MapPin, Briefcase, GraduationCap, Award, Globe, Edit2, RotateCcw, Check } from "lucide-react";

interface ResumeTemplateProps {
  data: ResumeData;
  template: TemplateType;
  onUpdateData?: (newData: ResumeData) => void;
}

export default function ResumeTemplate({ data, template, onUpdateData }: ResumeTemplateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<ResumeData>(data);

  // Sync data updates from parent
  React.useEffect(() => {
    setEditableData(data);
  }, [data]);

  const handleFieldChange = (section: string, field: string, value: any, index?: number) => {
    const updated = { ...editableData };
    if (index !== undefined) {
      if (section === "experience") {
        (updated.experience as any)[index][field] = value;
      } else if (section === "education") {
        (updated.education as any)[index][field] = value;
      }
    } else {
      if (section === "personalInfo") {
        (updated.personalInfo as any)[field] = value;
      }
    }
    setEditableData(updated);
    if (onUpdateData) {
      onUpdateData(updated);
    }
  };

  const handleArrayChange = (field: "skills" | "languages", index: number, value: string) => {
    const updated = { ...editableData };
    updated[field][index] = value;
    setEditableData(updated);
    if (onUpdateData) {
      onUpdateData(updated);
    }
  };

  const handleAddExperience = () => {
    const updated = { ...editableData };
    updated.experience.push({ role: "New Position", company: "Company Name", duration: "2025 - Present", description: "Role responsibilities and achievements..." });
    setEditableData(updated);
    if (onUpdateData) onUpdateData(updated);
  };

  const handleAddEducation = () => {
    const updated = { ...editableData };
    updated.education.push({ degree: "Degree Name", school: "University", year: "2025" });
    setEditableData(updated);
    if (onUpdateData) onUpdateData(updated);
  };

  const handleAddSkill = () => {
    const updated = { ...editableData };
    updated.skills.push("New Skill");
    setEditableData(updated);
    if (onUpdateData) onUpdateData(updated);
  };

  const handleRemoveItem = (section: "experience" | "education" | "skills" | "languages", index: number) => {
    const updated = { ...editableData };
    if (section === "experience") {
      updated.experience.splice(index, 1);
    } else if (section === "education") {
      updated.education.splice(index, 1);
    } else {
      updated[section].splice(index, 1);
    }
    setEditableData(updated);
    if (onUpdateData) onUpdateData(updated);
  };

  // Rendering Helper: Edit Controls overlay
  const editButton = (
    <div className="absolute top-4 right-4 z-20 no-pdf flex gap-2">
      <button
        onClick={() => setIsEditing(!isEditing)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-white border border-slate-700/80 hover:bg-slate-800 transition text-sm cursor-pointer"
        id="btn-edit-resume"
      >
        {isEditing ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span className="font-medium text-emerald-400">Save Changes</span>
          </>
        ) : (
          <>
            <Edit2 size={13} className="text-violet-400" />
            <span className="font-medium">Modify Details</span>
          </>
        )}
      </button>
    </div>
  );

  // Template 1: CLASSIC (Serif, Minimal corporate look, traditional spacing)
  const renderClassic = () => {
    const { personalInfo, skills, experience, education, languages } = editableData;
    return (
      <div className="font-serif bg-white text-slate-900 p-8 md:p-12 min-h-0 shadow-sm relative text-left">
        {editButton}
        
        {/* Header */}
        <div className="text-center border-b-[2px] border-slate-800 pb-6 mb-8">
          {isEditing ? (
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => handleFieldChange("personalInfo", "name", e.target.value)}
              className="font-bold text-3xl text-center w-full bg-slate-100 border border-slate-300 rounded mb-2 text-slate-900 px-2"
            />
          ) : (
            <h1 className="font-bold text-3xl uppercase tracking-wider text-slate-900">{personalInfo.name}</h1>
          )}
          
          <div className="flex flex-wrap justify-center gap-4 text-sm mt-3 text-slate-700">
            <span className="flex items-center gap-1">
              <Mail size={13} />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.email}
                  onChange={(e) => handleFieldChange("personalInfo", "email", e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded text-slate-900 text-xs px-1"
                />
              ) : (
                personalInfo.email
              )}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <Phone size={13} />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => handleFieldChange("personalInfo", "phone", e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded text-slate-900 text-xs px-1"
                />
              ) : (
                personalInfo.phone
              )}
            </span>
            <span>|</span>
            <span className="flex items-center gap-1">
              <MapPin size={13} />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => handleFieldChange("personalInfo", "location", e.target.value)}
                  className="bg-slate-100 border border-slate-300 rounded text-slate-900 text-xs px-1"
                />
              ) : (
                personalInfo.location
              )}
            </span>
          </div>
        </div>

        {/* Profile Summary */}
        <div className="mb-8">
          <h2 className="font-bold text-lg uppercase tracking-wide border-b border-slate-300 pb-1 mb-3 text-slate-800">Professional Summary</h2>
          {isEditing ? (
            <textarea
              value={personalInfo.summary}
              rows={3}
              onChange={(e) => handleFieldChange("personalInfo", "summary", e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded text-sm text-slate-900 p-2 font-serif"
            />
          ) : (
            <p className="text-slate-700 text-[14.5px] leading-relaxed text-left">{personalInfo.summary}</p>
          )}
        </div>

        {/* Professional Experience */}
        <div className="mb-8">
          <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-4">
            <h2 className="font-bold text-lg uppercase tracking-wide text-slate-800">Employment History</h2>
            {isEditing && (
              <button onClick={handleAddExperience} className="text-xs bg-slate-800 text-white py-1 px-2.5 rounded hover:bg-slate-700 cursor-pointer">
                + Add Experience
              </button>
            )}
          </div>

          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="relative group text-left">
                {isEditing && (
                  <button
                    onClick={() => handleRemoveItem("experience", idx)}
                    className="absolute -left-6 top-1 text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    ✕
                  </button>
                )}
                <div className="flex justify-between items-baseline font-semibold text-slate-900 text-[15px]">
                  {isEditing ? (
                    <div className="flex gap-2 w-full mb-1">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleFieldChange("experience", "role", e.target.value, idx)}
                        placeholder="Role"
                        className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs w-1/2"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleFieldChange("experience", "company", e.target.value, idx)}
                        placeholder="Company"
                        className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs w-1/2"
                      />
                    </div>
                  ) : (
                    <span>{exp.role} at {exp.company}</span>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleFieldChange("experience", "duration", e.target.value, idx)}
                      placeholder="Duration"
                      className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs ml-auto w-32"
                    />
                  ) : (
                    <span className="text-sm font-normal text-slate-500 shrink-0">{exp.duration}</span>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={exp.description}
                    rows={2}
                    onChange={(e) => handleFieldChange("experience", "description", e.target.value, idx)}
                    placeholder="Responsibilities"
                    className="w-full bg-slate-100 border border-slate-300 rounded text-xs p-1 font-serif text-slate-900 mt-1"
                  />
                ) : (
                  <p className="text-[13.5px] text-slate-600 mt-1 whitespace-pre-line leading-relaxed text-left">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="mb-8">
          <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-4">
            <h2 className="font-bold text-lg uppercase tracking-wide text-slate-800">Education</h2>
            {isEditing && (
              <button onClick={handleAddEducation} className="text-xs bg-slate-800 text-white py-1 px-2.5 rounded hover:bg-slate-700 cursor-pointer">
                + Add Education
              </button>
            )}
          </div>

          <div className="space-y-4">
            {education.map((edu, idx) => (
              <div key={idx} className="relative group text-left">
                {isEditing && (
                  <button
                    onClick={() => handleRemoveItem("education", idx)}
                    className="absolute -left-6 top-0 text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    ✕
                  </button>
                )}
                <div className="flex justify-between items-baseline font-semibold text-slate-800 text-[14.5px]">
                  {isEditing ? (
                    <div className="flex gap-2 w-full mb-1">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleFieldChange("education", "degree", e.target.value, idx)}
                        placeholder="Degree"
                        className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs w-1/2"
                      />
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleFieldChange("education", "school", e.target.value, idx)}
                        placeholder="School/University"
                        className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs w-1/2"
                      />
                    </div>
                  ) : (
                    <span>{edu.degree} - {edu.school}</span>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleFieldChange("education", "year", e.target.value, idx)}
                      placeholder="Year"
                      className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs ml-auto w-24"
                    />
                  ) : (
                    <span className="text-sm font-normal text-slate-500 shrink-0">{edu.year}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Skills and Languages */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center border-b border-slate-300 pb-1 mb-3">
              <h2 className="font-bold text-base uppercase tracking-wide text-slate-800">Core Expertise</h2>
              {isEditing && (
                <button onClick={handleAddSkill} className="text-[10px] bg-slate-850 text-white px-1.5 py-0.5 rounded cursor-pointer">
                  + Add
                </button>
              )}
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[13.5px] text-slate-700">
              {skills.map((skill, idx) => (
                <li key={idx}>
                  {isEditing ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange("skills", idx, e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs w-28 text-slate-900"
                      />
                      <button onClick={() => handleRemoveItem("skills", idx)} className="text-red-500 font-bold text-xs">✕</button>
                    </div>
                  ) : (
                    skill
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="border-b border-slate-300 pb-1 mb-3">
              <h2 className="font-bold text-base uppercase tracking-wide text-slate-800">Languages Spoken</h2>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[13.5px] text-slate-700">
              {languages.map((lang, idx) => (
                <span key={idx} className="relative">
                  {isEditing ? (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={lang}
                        onChange={(e) => handleArrayChange("languages", idx, e.target.value)}
                        className="bg-slate-100 border border-slate-300 rounded p-0.5 text-xs w-20 text-slate-900"
                      />
                      <button onClick={() => handleRemoveItem("languages", idx)} className="text-red-500 font-bold text-xs">✕</button>
                    </div>
                  ) : (
                    lang
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Template 2: MODERN (Modern fonts, double columns style layout, violet colored features)
  const renderModern = () => {
    const { personalInfo, skills, experience, education, languages } = editableData;
    return (
      <div className="font-sans bg-slate-50 text-slate-800 min-h-0 shadow-sm relative flex flex-col md:flex-row text-left">
        {editButton}
        
        {/* Left Slate Column */}
        <div className="w-full md:w-[35%] bg-slate-900 text-slate-100 p-8 flex flex-col gap-8 shrink-0">
          <div className="mt-8">
            {isEditing ? (
              <input
                type="text"
                value={personalInfo.name}
                onChange={(e) => handleFieldChange("personalInfo", "name", e.target.value)}
                className="font-extrabold text-2xl w-full bg-slate-800 border border-slate-755 rounded text-white px-2 py-1 mb-2"
              />
            ) : (
              <h1 className="font-extrabold text-3xl tracking-tight leading-none text-white">{personalInfo.name}</h1>
            )}
            <p className="text-violet-400 font-medium text-sm tracking-wide mt-2">TECHNICAL PROFESSIONAL</p>
          </div>

          <div className="border-t border-slate-800 pt-6 space-y-4">
            <h3 className="font-semibold text-xs tracking-widest text-slate-400 uppercase">Contact Details</h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-slate-300">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-violet-400 shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={personalInfo.email}
                    onChange={(e) => handleFieldChange("personalInfo", "email", e.target.value)}
                    className="bg-slate-800 text-white text-xs border border-slate-700 rounded p-1 w-full"
                  />
                ) : (
                  <span className="truncate">{personalInfo.email}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Phone size={14} className="text-violet-400 shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={personalInfo.phone}
                    onChange={(e) => handleFieldChange("personalInfo", "phone", e.target.value)}
                    className="bg-slate-800 text-white text-xs border border-slate-700 rounded p-1 w-full"
                  />
                ) : (
                  <span>{personalInfo.phone}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-violet-400 shrink-0" />
                {isEditing ? (
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => handleFieldChange("personalInfo", "location", e.target.value)}
                    className="bg-slate-800 text-white text-xs border border-slate-700 rounded p-1 w-full"
                  />
                ) : (
                  <span>{personalInfo.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Skills tags list */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-xs tracking-widest text-slate-400 uppercase">Areas of expertise</h3>
              {isEditing && (
                <button onClick={handleAddSkill} className="text-[10px] text-violet-400 hover:underline">
                  + Add
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="bg-slate-800/80 border border-slate-750 rounded-md px-2.5 py-1 text-xs font-medium text-slate-200 inline-flex items-center gap-1.5">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange("skills", idx, e.target.value)}
                        className="bg-slate-700 text-white text-[10px] w-16 p-0.5 rounded"
                      />
                      <button onClick={() => handleRemoveItem("skills", idx)} className="text-red-400 text-[10px]">✕</button>
                    </>
                  ) : (
                    skill
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Languages spoken */}
          <div className="space-y-2">
            <h3 className="font-semibold text-xs tracking-widest text-slate-400 uppercase">Language Proficiencies</h3>
            <div className="space-y-1.5">
              {languages.map((lang, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs text-slate-300">
                  {isEditing ? (
                    <div className="inline-flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={lang}
                        onChange={(e) => handleArrayChange("languages", idx, e.target.value)}
                        className="bg-slate-850 text-white text-[10px] border border-slate-700 rounded p-0.5 w-full"
                      />
                      <button onClick={() => handleRemoveItem("languages", idx)} className="text-red-400 text-xs">✕</button>
                    </div>
                  ) : (
                    <span>{lang}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Dynamic Column */}
        <div className="flex-1 p-8 md:p-12 bg-white flex flex-col gap-10">
          {/* Summary section */}
          <div>
            <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-2 mb-4">
              <Award className="text-violet-600" size={18} />
              <h2 className="font-bold text-sm tracking-widest uppercase">Professional Summary</h2>
            </div>
            {isEditing ? (
              <textarea
                value={personalInfo.summary}
                rows={3}
                onChange={(e) => handleFieldChange("personalInfo", "summary", e.target.value)}
                className="w-full bg-slate-100 border border-slate-300 rounded text-sm text-slate-900 p-2 font-sans"
              />
            ) : (
              <p className="text-[14px] leading-relaxed text-slate-600 text-left">{personalInfo.summary}</p>
            )}
          </div>

          {/* Work experience timeline */}
          <div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
              <div className="flex items-center gap-2 text-slate-900">
                <Briefcase className="text-violet-600" size={18} />
                <h2 className="font-bold text-sm tracking-widest uppercase">Career Progress</h2>
              </div>
              {isEditing && (
                <button onClick={handleAddExperience} className="text-xs text-violet-600 hover:underline">
                  + Add Position
                </button>
              )}
            </div>

            <div className="space-y-6">
              {experience.map((exp, idx) => (
                <div key={idx} className="relative group text-left">
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveItem("experience", idx)}
                      className="absolute -right-4 top-0 text-red-500 hover:text-red-700 font-bold text-xs"
                    >
                      ✕
                    </button>
                  )}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    {isEditing ? (
                      <div className="flex gap-2 w-full mb-1">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleFieldChange("experience", "role", e.target.value, idx)}
                          placeholder="Role"
                          className="bg-slate-100 border border-slate-300 rounded p-1 text-xs w-1/2 text-slate-950 font-sans"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleFieldChange("experience", "company", e.target.value, idx)}
                          placeholder="Company"
                          className="bg-slate-100 border border-slate-300 rounded p-1 text-xs w-1/2 text-slate-950 font-sans"
                        />
                      </div>
                    ) : (
                      <h4 className="font-bold text-[#1e1540] text-[15px]">{exp.role} • <span className="font-semibold text-slate-550">{exp.company}</span></h4>
                    )}

                    {isEditing ? (
                      <input
                        type="text"
                        value={exp.duration}
                        onChange={(e) => handleFieldChange("experience", "duration", e.target.value, idx)}
                        placeholder="Duration"
                        className="bg-slate-100 border border-slate-300 rounded p-1 text-xs w-32 mt-1 text-slate-950 font-sans"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-violet-600 bg-violet-50 rounded px-2.5 py-0.5 inline-block sm:mt-0 shrink-0 self-start sm:self-center">{exp.duration}</span>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      value={exp.description}
                      rows={2}
                      onChange={(e) => handleFieldChange("experience", "description", e.target.value, idx)}
                      placeholder="Responsibilities"
                      className="w-full bg-slate-100 border border-slate-300 rounded text-xs p-1 mt-1 text-slate-950 font-sans"
                    />
                  ) : (
                    <p className="text-[13.5px] text-slate-650 leading-relaxed text-left whitespace-pre-line">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Academic Background */}
          <div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-4">
              <div className="flex items-center gap-2 text-slate-900">
                <GraduationCap className="text-violet-600" size={18} />
                <h2 className="font-bold text-sm tracking-widest uppercase">Academic Background</h2>
              </div>
              {isEditing && (
                <button onClick={handleAddEducation} className="text-xs text-violet-600 hover:underline">
                  + Add Education
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 p-4 rounded-xl relative group text-left">
                  {isEditing && (
                    <button
                      onClick={() => handleRemoveItem("education", idx)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-xs"
                    >
                      ✕
                    </button>
                  )}
                  {isEditing ? (
                    <div className="space-y-1 text-slate-950 font-sans">
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleFieldChange("education", "degree", e.target.value, idx)}
                        placeholder="Degree"
                        className="bg-white border border-slate-300 rounded p-0.5 text-xs w-full"
                      />
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleFieldChange("education", "school", e.target.value, idx)}
                        placeholder="School"
                        className="bg-white border border-slate-300 rounded p-0.5 text-xs w-full"
                      />
                      <input
                        type="text"
                        value={edu.year}
                        onChange={(e) => handleFieldChange("education", "year", e.target.value, idx)}
                        placeholder="Year"
                        className="bg-white border border-slate-300 rounded p-0.5 text-xs w-full"
                      />
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-violet-500">{edu.year}</span>
                      <h5 className="font-semibold text-slate-800 text-sm mt-1">{edu.degree}</h5>
                      <span className="text-xs text-slate-550 leading-normal block">{edu.school}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Template 3: SAFFRON (Gold and saffron styled design based on Indian traditional heritage professional look)
  const renderSaffron = () => {
    const { personalInfo, skills, experience, education, languages } = editableData;
    return (
      <div className="font-sans bg-amber-50 text-amber-950 p-8 md:p-12 min-h-0 border-4 border-amber-200/60 shadow-sm relative text-left">
        {editButton}

        {/* Traditional Heritage Framing */}
        <div className="absolute top-2 left-2 right-2 bottom-2 border border-dashed border-amber-300 pointer-events-none rounded-sm"></div>

        {/* Header Block */}
        <div className="text-center pb-6 mb-8 border-b-2 border-amber-400 relative">
          {isEditing ? (
            <input
              type="text"
              value={personalInfo.name}
              onChange={(e) => handleFieldChange("personalInfo", "name", e.target.value)}
              className="font-extrabold text-3xl text-center w-full bg-amber-100/90 border border-amber-300 rounded mb-2 text-amber-950 px-2"
            />
          ) : (
            <h1 className="font-serif font-extrabold text-3xl uppercase tracking-wider text-amber-900">{personalInfo.name}</h1>
          )}

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs mt-3 text-amber-800 font-medium font-sans">
            <span className="flex items-center gap-1">
              <Mail size={13} className="text-amber-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.email}
                  onChange={(e) => handleFieldChange("personalInfo", "email", e.target.value)}
                  className="bg-amber-100/95 border border-amber-200 rounded text-amber-900 text-xs px-1"
                />
              ) : (
                personalInfo.email
              )}
            </span>
            <span className="flex items-center gap-1">
              <Phone size={13} className="text-amber-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.phone}
                  onChange={(e) => handleFieldChange("personalInfo", "phone", e.target.value)}
                  className="bg-amber-100/95 border border-amber-200 rounded text-amber-900 text-xs px-1"
                />
              ) : (
                personalInfo.phone
              )}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={13} className="text-amber-600" />
              {isEditing ? (
                <input
                  type="text"
                  value={personalInfo.location}
                  onChange={(e) => handleFieldChange("personalInfo", "location", e.target.value)}
                  className="bg-amber-100/95 border border-amber-200 rounded text-amber-900 text-xs px-1"
                />
              ) : (
                personalInfo.location
              )}
            </span>
          </div>
        </div>

        {/* Profile Objective */}
        <div className="mb-8 relative z-10">
          <h2 className="font-serif font-extrabold text-lg text-amber-900 border-b border-amber-300 pb-1 mb-3">Professional Summary</h2>
          {isEditing ? (
            <textarea
              value={personalInfo.summary}
              rows={3}
              onChange={(e) => handleFieldChange("personalInfo", "summary", e.target.value)}
              className="w-full bg-amber-100/90 border border-amber-350 rounded text-sm text-amber-950 p-2 font-sans"
            />
          ) : (
            <p className="text-amber-900 text-sm leading-relaxed text-left font-serif">{personalInfo.summary}</p>
          )}
        </div>

        {/* Experience Column */}
        <div className="mb-8 relative z-10">
          <div className="flex justify-between items-center border-b border-amber-300 pb-1 mb-4">
            <h2 className="font-serif font-extrabold text-lg text-amber-900">Employment Overview</h2>
            {isEditing && (
              <button onClick={handleAddExperience} className="text-xs bg-amber-800 text-white py-1 px-2.5 rounded hover:bg-amber-900 cursor-pointer">
                + Add Role
              </button>
            )}
          </div>

          <div className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={idx} className="relative group text-left">
                {isEditing && (
                  <button
                    onClick={() => handleRemoveItem("experience", idx)}
                    className="absolute -left-6 top-1 text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    ✕
                  </button>
                )}
                <div className="flex justify-between items-baseline font-bold text-amber-900 text-[15px] font-serif">
                  {isEditing ? (
                    <div className="flex gap-2 w-full mb-1">
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleFieldChange("experience", "role", e.target.value, idx)}
                        placeholder="Role"
                        className="bg-amber-100/90 border border-amber-300 rounded p-0.5 text-xs w-1/2 text-amber-950 font-sans"
                      />
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleFieldChange("experience", "company", e.target.value, idx)}
                        placeholder="Company"
                        className="bg-amber-100/90 border border-amber-300 rounded p-0.5 text-xs w-1/2 text-amber-950 font-sans"
                      />
                    </div>
                  ) : (
                    <span>{exp.role} — <span className="italic font-normal">{exp.company}</span></span>
                  )}

                  {isEditing ? (
                    <input
                      type="text"
                      value={exp.duration}
                      onChange={(e) => handleFieldChange("experience", "duration", e.target.value, idx)}
                      placeholder="Duration"
                      className="bg-amber-100/90 border border-amber-300 rounded p-0.5 text-xs ml-auto w-32 text-amber-950 font-sans"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-amber-700 shrink-0 bg-amber-100/90 px-3 py-1 rounded">{exp.duration}</span>
                  )}
                </div>

                {isEditing ? (
                  <textarea
                    value={exp.description}
                    rows={2}
                    onChange={(e) => handleFieldChange("experience", "description", e.target.value, idx)}
                    placeholder="Responsibilities"
                    className="w-full bg-amber-100/90 border border-amber-300 rounded text-xs p-1 mt-1 text-amber-950 font-sans"
                  />
                ) : (
                  <p className="text-xs text-amber-850 mt-1 whitespace-pre-line leading-relaxed text-left font-sans">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Education Block */}
        <div className="mb-8 relative z-10 overflow-hidden">
          <div className="flex justify-between items-center border-b border-amber-300 pb-1 mb-4">
            <h2 className="font-serif font-extrabold text-lg text-amber-900">Academic History</h2>
            {isEditing && (
              <button onClick={handleAddEducation} className="text-xs bg-amber-800 text-white py-1 px-2.5 rounded hover:bg-amber-900 cursor-pointer">
                + Add Edu
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {education.map((edu, idx) => (
              <div key={idx} className="border border-dashed border-amber-300/80 p-3 rounded bg-amber-100/30 relative text-left">
                {isEditing && (
                  <button
                    onClick={() => handleRemoveItem("education", idx)}
                    className="absolute -left-6 top-1 text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    ✕
                  </button>
                )}
                {isEditing ? (
                  <div className="space-y-1 text-amber-950 font-sans">
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleFieldChange("education", "degree", e.target.value, idx)}
                      className="bg-white border border-amber-300 rounded p-0.5 text-xs w-full"
                    />
                    <input
                      type="text"
                      value={edu.school}
                      onChange={(e) => handleFieldChange("education", "school", e.target.value, idx)}
                      className="bg-white border border-amber-300 rounded p-0.5 text-xs w-full"
                    />
                    <input
                      type="text"
                      value={edu.year}
                      onChange={(e) => handleFieldChange("education", "year", e.target.value, idx)}
                      className="bg-white border border-amber-300 rounded p-0.5 text-xs w-full"
                    />
                  </div>
                ) : (
                  <>
                    <h5 className="font-bold text-amber-900 text-sm font-serif">{edu.degree}</h5>
                    <div className="flex justify-between text-xs mt-1 text-amber-800">
                      <span>{edu.school}</span>
                      <span className="font-semibold text-amber-700">{edu.year}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Skills & languages footer grids */}
        <div className="grid grid-cols-2 gap-8 relative z-10">
          <div>
            <div className="flex justify-between items-center border-b border-amber-300 pb-1 mb-3">
              <h2 className="font-serif font-extrabold text-base text-amber-900">Key Expertise</h2>
              {isEditing && (
                <button onClick={handleAddSkill} className="text-[10px] bg-amber-800 text-white px-2 py-0.5 rounded cursor-pointer">
                  + Add
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <span key={idx} className="bg-amber-600/10 text-amber-800 border border-amber-600/20 px-2.5 py-1 text-xs font-semibold rounded inline-flex items-center gap-1.5 font-serif">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => handleArrayChange("skills", idx, e.target.value)}
                        className="bg-white text-slate-800 text-[10px] w-16 p-0.5 rounded font-sans"
                      />
                      <button onClick={() => handleRemoveItem("skills", idx)} className="text-red-500 font-bold text-xs">✕</button>
                    </>
                  ) : (
                    skill
                  )}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="border-b border-amber-300 pb-1 mb-3">
              <h2 className="font-serif font-extrabold text-base text-amber-900">Languages</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang, idx) => (
                <span key={idx} className="bg-amber-100/90 text-amber-900 border border-amber-200 px-2.5 py-1 text-xs font-medium rounded inline-flex items-center gap-1.5">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={lang}
                        onChange={(e) => handleArrayChange("languages", idx, e.target.value)}
                        className="bg-white text-slate-800 text-[10px] w-14 p-0.5 rounded font-sans"
                      />
                      <button onClick={() => handleRemoveItem("languages", idx)} className="text-red-500 font-bold text-xs">✕</button>
                    </>
                  ) : (
                    lang
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  switch (template) {
    case "Classic":
      return renderClassic();
    case "Modern":
      return renderModern();
    case "Saffron":
      return renderSaffron();
    default:
      return renderModern();
  }
}
