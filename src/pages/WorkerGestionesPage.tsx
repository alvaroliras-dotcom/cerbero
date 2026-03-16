import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminTheme } from "../ui/adminTheme";

type DownloadRange = "week" | "month" | "custom";
type RequestType = "vacaciones" | "dia_libre" | "otro";

function BackIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M10.2 9.5a2.2 2.2 0 1 1 3.3 1.9c-.8.48-1.2.9-1.2 1.75"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="16.9" r="1" fill="currentColor" />
    </svg>
  );
}

function DownloadBadgeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v8" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <path
        d="m8.8 10.8 3.2 3.2 3.2-3.2"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5.5 18.2h13" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
    </svg>
  );
}

function MailBadgeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="m6 8 6 4.8L18 8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5.2" width="16" height="14" rx="2.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 3.8v3M16 3.8v3M4 9h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.3 12.7h.01M12 12.7h.01M15.7 12.7h.01"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarClockIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.8" y="5.2" width="12.4" height="12.4" rx="2.3" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 3.8v3M13 3.8v3M3.8 8.8h12.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18.1" cy="16.8" r="3.8" stroke="currentColor" strokeWidth="2" />
      <path
        d="M18.1 15.2v1.8l1.2.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3.8h5.6L18 8.2v11a1.8 1.8 0 0 1-1.8 1.8H8a1.8 1.8 0 0 1-1.8-1.8V5.6A1.8 1.8 0 0 1 8 3.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M13.3 3.8v4.4H18" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PalmIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11.5 18.5V7.2a1 1 0 1 1 2 0v3.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9.1 17.4V9.7a1 1 0 1 1 2 0v7.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M13.9 17.2v-6.4a1 1 0 1 1 2 0v5.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6.5 19.5c1.1-1 1.9-2.5 1.9-4.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M5.5 19.8h12.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M17.9 19.4c-.9-1.1-1.3-2.3-1.3-3.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function DayOffIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.4" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3.8v3M16 3.8v3M4 9h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 12.2v2.4M10.8 13.4h2.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 18.2 5 19.5v-2.6a6.6 6.6 0 0 1-.8-3.1C4.2 9.8 7.6 6.7 12 6.7s7.8 3.1 7.8 7.1-3.4 7.1-7.8 7.1c-1.7 0-3.3-.5-5-1.7Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M9.5 13.7h.01M12 13.7h.01M14.5 13.7h.01" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function InputCalendarIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.2" y="5.2" width="15.6" height="14" rx="2.3" stroke="currentColor" strokeWidth="2" />
      <path d="M8 3.8v3M16 3.8v3M4.2 9h15.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 4 10.5 13.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
      <path
        d="m20 4-6 15-3.2-6L4 9.8 20 4Z"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SelectionCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 104,
        borderRadius: 18,
        border: `1px solid ${active ? "transparent" : adminTheme.colors.border}`,
        background: active
          ? `linear-gradient(180deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%)`
          : adminTheme.colors.panelBg,
        color: active ? adminTheme.colors.textOnPrimary : adminTheme.colors.text,
        boxShadow: active ? "0 10px 22px rgba(24, 156, 138, 0.20)" : "none",
        display: "grid",
        placeItems: "center",
        gap: 8,
        cursor: "pointer",
        padding: "12px 8px",
        textAlign: "center",
      }}
    >
      <div style={{ display: "grid", placeItems: "center" }}>{icon}</div>
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.15,
          fontWeight: active ? 900 : 850,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </div>
    </button>
  );
}

function RequestTypeCard({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 98,
        borderRadius: 18,
        border: `1px solid ${active ? "transparent" : adminTheme.colors.border}`,
        background: active
          ? `linear-gradient(180deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%)`
          : adminTheme.colors.panelBg,
        color: active ? adminTheme.colors.textOnPrimary : adminTheme.colors.text,
        boxShadow: active ? "0 10px 22px rgba(24, 156, 138, 0.20)" : "none",
        display: "grid",
        placeItems: "center",
        gap: 8,
        cursor: "pointer",
        padding: "12px 8px",
        textAlign: "center",
      }}
    >
      <div style={{ display: "grid", placeItems: "center" }}>{icon}</div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.15,
          fontWeight: active ? 900 : 850,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </div>
    </button>
  );
}

function InputShell({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: 58,
        borderRadius: 16,
        border: `1px solid ${adminTheme.colors.border}`,
        background: adminTheme.colors.panelBg,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 14px",
      }}
    >
      <div style={{ color: adminTheme.colors.text }}>{icon}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export function WorkerGestionesPage() {
  const navigate = useNavigate();

  const [downloadRange, setDownloadRange] = useState<DownloadRange>("week");
  const [requestType, setRequestType] = useState<RequestType>("vacaciones");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [comment, setComment] = useState("");

  const downloadLabel = useMemo(() => {
    if (downloadRange === "week") return "Esta semana";
    if (downloadRange === "month") return "Este mes";
    return "Rango personalizado";
  }, [downloadRange]);

  return (
    <div
      className="workerGestionesPageUi"
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `linear-gradient(180deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%)`,
        display: "flex",
        justifyContent: "center",
        padding: 14,
      }}
    >
      <style>{`
        .workerGestionesPageUi * {
          box-sizing: border-box;
        }

        .workerGestionesShell {
          width: 100%;
          max-width: 520px;
          display: grid;
          gap: 12px;
        }

        .workerGestionesTopCard {
          background: ${adminTheme.colors.panelBg};
          border-radius: 22px;
          border: 1px solid ${adminTheme.colors.border};
          box-shadow: ${adminTheme.shadow.lg};
          overflow: hidden;
          backdrop-filter: blur(6px);
        }

        .workerGestionesHeader {
          display: grid;
          grid-template-columns: 46px 1fr 46px;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border-bottom: 1px solid ${adminTheme.colors.border};
          background: rgba(255,255,255,0.35);
        }

        .workerGestionesHeaderTitle {
          text-align: center;
          font-size: 20px;
          line-height: 1.08;
          font-weight: 950;
          color: ${adminTheme.colors.text};
          letter-spacing: -0.4px;
        }

        .workerGestionesRoundBtn {
          width: 46px;
          height: 46px;
          border-radius: 14px;
          border: 1px solid ${adminTheme.colors.border};
          background: ${adminTheme.colors.panelSoft};
          color: ${adminTheme.colors.text};
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .workerGestionesContent {
          padding: 12px;
          display: grid;
          gap: 12px;
        }

        .workerBlock {
          background: ${adminTheme.colors.panelSoft};
          border-radius: 20px;
          border: 1px solid ${adminTheme.colors.border};
          padding: 16px;
          box-shadow: ${adminTheme.shadow.sm};
        }

        .workerBlockHeader {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 14px;
        }

        .workerBlockBadge {
          width: 48px;
          height: 48px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
          color: ${adminTheme.colors.textOnPrimary};
        }

        .workerBlockTitle {
          font-size: 22px;
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -0.4px;
          color: ${adminTheme.colors.text};
        }

        .workerBlockSub {
          margin-top: 4px;
          font-size: 13px;
          line-height: 1.25;
          color: ${adminTheme.colors.textSoft};
          font-weight: 700;
        }

        .workerCardsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
        }

        .workerSectionLabelRow {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .workerSectionLabel {
          font-size: 13px;
          color: ${adminTheme.colors.textSoft};
          font-weight: 900;
          letter-spacing: -0.1px;
        }

        .workerFileSelect {
          height: 54px;
          border-radius: 16px;
          border: 1px solid ${adminTheme.colors.border};
          background: ${adminTheme.colors.panelBg};
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 0 14px;
          color: ${adminTheme.colors.text};
        }

        .workerFileSelectLeft {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .workerFileSelectValue {
          font-size: 15px;
          font-weight: 700;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .workerMainCta {
          margin-top: 14px;
          height: 58px;
          width: 100%;
          border: none;
          border-radius: 18px;
          background: linear-gradient(90deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%);
          color: ${adminTheme.colors.textOnPrimary};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 950;
          letter-spacing: -0.2px;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(24, 156, 138, 0.18);
        }

        .workerRequestGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 10px;
        }

        .workerFieldLabel {
          margin-top: 16px;
          margin-bottom: 8px;
          font-size: 13px;
          color: ${adminTheme.colors.textSoft};
          font-weight: 900;
          letter-spacing: -0.1px;
        }

        .workerDateGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .workerDateInput,
        .workerTextArea {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: ${adminTheme.colors.text};
          font-size: 15px;
          font-weight: 700;
        }

        .workerDateInput::placeholder,
        .workerTextArea::placeholder {
          color: ${adminTheme.colors.textMuted};
        }

        .workerTextAreaWrap {
          min-height: 126px;
          border-radius: 18px;
          border: 1px solid ${adminTheme.colors.border};
          background: ${adminTheme.colors.panelBg};
          padding: 14px;
        }

        .workerTextArea {
          resize: none;
          min-height: 96px;
          font-family: inherit;
          line-height: 1.4;
        }

        .workerSendBtn {
          margin-top: 14px;
          width: 100%;
          height: 58px;
          border: none;
          border-radius: 18px;
          background: linear-gradient(90deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%);
          color: ${adminTheme.colors.textOnPrimary};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 17px;
          font-weight: 950;
          letter-spacing: -0.2px;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(24, 156, 138, 0.18);
        }

        @media (max-width: 560px) {
          .workerGestionesShell {
            max-width: 520px;
          }

          .workerCardsGrid,
          .workerRequestGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
          }

          .workerDateGrid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .workerBlockTitle {
            font-size: 20px;
          }

          .workerBlockSub {
            font-size: 12px;
          }
        }
      `}</style>

      <div className="workerGestionesShell">
        <div className="workerGestionesTopCard">
          <div className="workerGestionesHeader">
            <button
              type="button"
              className="workerGestionesRoundBtn"
              onClick={() => navigate("/worker")}
              aria-label="Volver"
              title="Volver"
            >
              <BackIcon />
            </button>

            <div className="workerGestionesHeaderTitle">Gestiones y Descargas</div>

            <button
              type="button"
              className="workerGestionesRoundBtn"
              aria-label="Ayuda"
              title="Ayuda"
            >
              <HelpIcon />
            </button>
          </div>

          <div className="workerGestionesContent">
            <section className="workerBlock">
              <div className="workerBlockHeader">
                <div
                  className="workerBlockBadge"
                  style={{
                    background: `linear-gradient(180deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%)`,
                  }}
                >
                  <DownloadBadgeIcon />
                </div>

                <div>
                  <div className="workerBlockTitle">Descargar historial</div>
                  <div className="workerBlockSub">Exporta tus fichajes en CSV</div>
                </div>
              </div>

              <div className="workerCardsGrid">
                <SelectionCard
                  active={downloadRange === "week"}
                  onClick={() => setDownloadRange("week")}
                  icon={<CalendarIcon />}
                  label="Esta semana"
                />

                <SelectionCard
                  active={downloadRange === "month"}
                  onClick={() => setDownloadRange("month")}
                  icon={<CalendarIcon />}
                  label="Este mes"
                />

                <SelectionCard
                  active={downloadRange === "custom"}
                  onClick={() => setDownloadRange("custom")}
                  icon={<CalendarClockIcon />}
                  label={
                    <>
                      Rango
                      <br />
                      personal.
                    </>
                  }
                />
              </div>

              <div className="workerSectionLabelRow">
                <div className="workerSectionLabel">Formato de archivo</div>

                <div className="workerFileSelect">
                  <div className="workerFileSelectLeft">
                    <FileIcon />
                    <div className="workerFileSelectValue">CSV (Excel)</div>
                  </div>
                  <ChevronDownIcon />
                </div>
              </div>

              <button type="button" className="workerMainCta" title={`Descargar ${downloadLabel}`}>
                <DownloadBadgeIcon />
                <span>DESCARGAR</span>
              </button>
            </section>

            <section className="workerBlock">
              <div className="workerBlockHeader">
                <div
                  className="workerBlockBadge"
                  style={{
                    background: `linear-gradient(180deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%)`,
                  }}
                >
                  <MailBadgeIcon />
                </div>

                <div>
                  <div className="workerBlockTitle">Solicitar día libre o vacaciones</div>
                  <div className="workerBlockSub">Envía una solicitud al equipo</div>
                </div>
              </div>

              <div className="workerFieldLabel">Tipo de solicitud</div>

              <div className="workerRequestGrid">
                <RequestTypeCard
                  active={requestType === "vacaciones"}
                  onClick={() => setRequestType("vacaciones")}
                  icon={<PalmIcon />}
                  label="Vacaciones"
                />

                <RequestTypeCard
                  active={requestType === "dia_libre"}
                  onClick={() => setRequestType("dia_libre")}
                  icon={<DayOffIcon />}
                  label="Día libre"
                />

                <RequestTypeCard
                  active={requestType === "otro"}
                  onClick={() => setRequestType("otro")}
                  icon={<ChatIcon />}
                  label="Otro"
                />
              </div>

              <div className="workerFieldLabel">Fechas</div>

              <div className="workerDateGrid">
                <InputShell icon={<InputCalendarIcon />}>
                  <input
                    className="workerDateInput"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    aria-label="Fecha inicio"
                  />
                </InputShell>

                <InputShell icon={<InputCalendarIcon />}>
                  <input
                    className="workerDateInput"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    aria-label="Fecha fin"
                  />
                </InputShell>
              </div>

              <div className="workerFieldLabel">
                Motivo o comentario <span style={{ color: adminTheme.colors.textMuted, fontWeight: 700 }}>(opcional)</span>
              </div>

              <div className="workerTextAreaWrap">
                <textarea
                  className="workerTextArea"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Explícales el motivo de tu solicitud..."
                />
              </div>

              <button type="button" className="workerSendBtn" title="Enviar solicitud">
                <SendIcon />
                <span>ENVIAR SOLICITUD</span>
              </button>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}