"use client";

import { useState } from "react";

export default function AuthPasswordField({ value, onChange, signup = false }: {
  value: string;
  onChange: (value: string) => void;
  signup?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="auth-field">
      <label htmlFor="password">Password</label>
      <div className="auth-password">
        <input
          id="password"
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={signup ? "new-password" : "current-password"}
          minLength={signup ? 8 : undefined}
          aria-describedby={signup ? "password-hint" : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
        />
        <button type="button" aria-label={visible ? "Hide password" : "Show password"} aria-controls="password" aria-pressed={visible} onClick={() => setVisible(!visible)}>
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {signup && <p id="password-hint" className="auth-hint">Use at least 8 characters.</p>}
    </div>
  );
}
