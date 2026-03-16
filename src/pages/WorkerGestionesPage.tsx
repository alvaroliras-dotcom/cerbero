import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminTheme } from "../ui/adminTheme";

type DownloadRange = "week" | "month" | "custom";
type RequestType = "vacaciones" | "dia_libre" | "otro";

function BackIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" />
      <path
        d="M9.9 9.4a2.45 2.45 0 1 1 3.7 2.1c-.9.53-1.35.95-1.35 1.95"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="17.2" r="1.1" fill="currentColor" />
    </svg>
  );
}

function DownloadBadgeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 4v10"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        d="M8.5 10.5 12 14l3.5-3.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18h14"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailBadgeIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2.6" stroke="currentColor" strokeWidth="2" />
      <path
        d="m6 8 6 5 6-5"
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
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5.5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 3.8v3.4M16 3.8v3.4M4 9.3h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.2 12.7h.01M12 12.7h.01M15.8 12.7h.01"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CalendarClockIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.7" y="5.2" width="12.8" height="12.8" rx="2.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M7 3.7v3.1M13.2 3.7v3.1M3.7 9h12.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="18.2" cy="17.2" r="4.1" stroke="currentColor" strokeWidth="2" />
      <path
        d="M18.2 15.5v2l1.4.8"
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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3.8h5.8L18.2 8v11.2a1.8 1.8 0 0 1-1.8 1.8H8a1.8 1.8 0 0 1-1.8-1.8V5.6A1.8 1.8 0 0 1 8 3.8Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 3.8V8h4.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11.5 19.5V7.2a1.1 1.1 0 1 1 2.2 0v4.1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8.8 18V9.8a1.05 1.05 0 1 1 2.1 0V18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14.2 17.6v-7a1.05 1.05 0 1 1 2.1 0v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6.5 20.2c1.2-1.1 2.1-2.8 2.1-4.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M5.4 20.5h13.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.2 20.1c-1-1.2-1.4-2.5-1.4-4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.8 20.5 21 17.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M17.7 8.4c1.3-.3 2.4-1.3 2.9-2.7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M18.3 5.2c.9.2 1.9.1 2.7-.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DayOffIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="5" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 3.6v3.2M16 3.6v3.2M4 9h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 12.2v2.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10.7 13.5H13.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7 18.5 4.8 20v-3A6.8 6.8 0 0 1 4 13.8C4 9.5 7.6 6 12 6s8 3.5 8 7.8-3.6 7.7-8 7.7c-1.8 0-3.4-.5-5-1.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.3 13.9h.01M12 13.9h.01M14.7 13.9h.01"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function InputCalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4.2" y="5.2" width="15.6" height="14.2" rx="2.4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 3.8v3.1M16 3.8v3.1M4.2 9h15.6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 4 10.2 13.8"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="m20 4-6.1 16-3.4-6.5L4 10.1 20 4Z"
        stroke="currentColor"
        strokeWidth="2.2"
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
        minHeight: 156,
        borderRadius: 22,
        border: `1px solid ${active ? "transparent" : adminTheme.colors.border}`,
        background: active ? "linear-gradient(180deg, #3CB7B7 0%, #35AFAF 100%)" : adminTheme.colors.panelBg,
        color: active ? "#ffffff" : adminTheme.colors.text,
        boxShadow: active ? "0 12px 28px rgba(18, 162, 158, 0.22)" : "none",
        display: "grid",
        placeItems: "center",
        gap: 12,
        cursor: "pointer",
        padding: "18px 14px",
        textAlign: "center",
      }}
    >
      <div style={{ display: "grid", placeItems: "center" }}>{icon}</div>
      <div
        style={{
          fontSize: 19,
          lineHeight: 1.2,
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
        minHeight: 120,
        borderRadius: 22,
        border: `1px solid ${active ? "transparent" : adminTheme.colors.border}`,
        background: active ? "#0A8294" : adminTheme.colors.panelBg,
        color: active ? "#ffffff" : adminTheme.colors.text,
        boxShadow: active ? "0 12px 24px rgba(10, 130, 148, 0.20)" : "none",
        display: "grid",
        placeItems: "center",
        gap: 10,
        cursor: "pointer",
        padding: "16px 12px",
        textAlign: "center",
      }}
    >
      <div style={{ display: "grid", placeItems: "center" }}>{icon}</div>
      <div
        style={{
          fontSize: 17,
          lineHeight: 1.2,
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
        height: 72,
        borderRadius: 20,
        border: `1px solid ${adminTheme.colors.border}`,
        background: adminTheme.colors.panelBg,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "0 18px",
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
        background: "linear-gradient(180deg, #43B8B8 0%, #DDF1EF 100%)",
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
          max-width: 820px;
        }

        .workerGestionesTopCard {
          background: rgba(255,255,255,0.92);
          border-radius: 30px;
          box-shadow: 0 28px 52px rgba(11, 58, 73, 0.16);
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.6);
          backdrop-filter: blur(10px);
        }

        .workerGestionesHeader {
          display: grid;
          grid-template-columns: 72px 1fr 72px;
          align-items: center;
          gap: 10px;
          padding: 16px 22px;
          background: rgba(255,255,255,0.74);
          border-bottom: 1px solid rgba(31, 52, 96, 0.06);
        }

        .workerGestionesHeaderTitle {
          text-align: center;
          font-size: 28px;
          line-height: 1.05;
          font-weight: 950;
          color: #24375D;
          letter-spacing: -0.8px;
        }

        .workerGestionesRoundBtn {
          width: 56px;
          height: 56px;
          border-radius: 999px;
          border: none;
          background: #EEF0F4;
          color: #24375D;
          display: grid;
          place-items: center;
          cursor: pointer;
          box-shadow: inset 0 0 0 1px rgba(36,55,93,0.06);
        }

        .workerGestionesContent {
          padding: 16px 18px 22px;
          display: grid;
          gap: 18px;
          background: rgba(255,255,255,0.22);
        }

        .workerBlock {
          background: rgba(255,255,255,0.82);
          border-radius: 28px;
          border: 1px solid rgba(36,55,93,0.06);
          padding: 26px;
          box-shadow: 0 14px 34px rgba(14, 53, 75, 0.08);
        }

        .workerBlockHeader {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 20px;
        }

        .workerBlockBadge {
          width: 64px;
          height: 64px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }

        .workerBlockTitle {
          font-size: 28px;
          line-height: 1.08;
          font-weight: 950;
          letter-spacing: -0.7px;
          color: #24375D;
        }

        .workerBlockSub {
          margin-top: 6px;
          font-size: 18px;
          line-height: 1.25;
          color: #7482A0;
          font-weight: 500;
        }

        .workerCardsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .workerSectionLabelRow {
          margin-top: 22px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 18px;
          align-items: center;
        }

        .workerSectionLabel {
          font-size: 16px;
          color: #4B5B7F;
          font-weight: 900;
          letter-spacing: -0.2px;
        }

        .workerFileSelect {
          height: 66px;
          border-radius: 20px;
          border: 1px solid ${adminTheme.colors.border};
          background: ${adminTheme.colors.panelBg};
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 0 18px;
          color: #2D3F66;
        }

        .workerFileSelectLeft {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .workerFileSelectValue {
          font-size: 18px;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .workerMainCta {
          margin-top: 20px;
          height: 72px;
          width: 100%;
          border: none;
          border-radius: 24px;
          background: linear-gradient(90deg, #20AFA4 0%, #149E86 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          font-size: 24px;
          font-weight: 950;
          letter-spacing: -0.4px;
          cursor: pointer;
          box-shadow: 0 16px 28px rgba(24, 156, 138, 0.24);
        }

        .workerRequestGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-top: 14px;
        }

        .workerFieldLabel {
          margin-top: 22px;
          margin-bottom: 10px;
          font-size: 16px;
          color: #3E4E73;
          font-weight: 900;
          letter-spacing: -0.2px;
        }

        .workerDateGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .workerDateInput,
        .workerTextArea {
          width: 100%;
          border: none;
          outline: none;
          background: transparent;
          color: #24375D;
          font-size: 17px;
          font-weight: 500;
        }

        .workerDateInput::placeholder,
        .workerTextArea::placeholder {
          color: #8B96AD;
        }

        .workerTextAreaWrap {
          min-height: 156px;
          border-radius: 22px;
          border: 1px solid ${adminTheme.colors.border};
          background: ${adminTheme.colors.panelBg};
          padding: 18px 20px;
        }

        .workerTextArea {
          resize: none;
          min-height: 118px;
          font-family: inherit;
          line-height: 1.45;
        }

        .workerSendBtn {
          margin-top: 18px;
          width: 100%;
          height: 72px;
          border: none;
          border-radius: 24px;
          background: linear-gradient(90deg, #2B8DE6 0%, #2B7FD2 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: -0.3px;
          cursor: pointer;
          box-shadow: 0 16px 28px rgba(43, 128, 210, 0.24);
        }

        @media (max-width: 760px) {
          .workerGestionesHeader {
            grid-template-columns: 56px 1fr 56px;
            padding: 14px 16px;
          }

          .workerGestionesHeaderTitle {
            font-size: 24px;
          }

          .workerGestionesRoundBtn {
            width: 48px;
            height: 48px;
          }

          .workerGestionesContent {
            padding: 14px;
            gap: 16px;
          }

          .workerBlock {
            padding: 22px 18px;
            border-radius: 26px;
          }

          .workerBlockHeader {
            gap: 14px;
            margin-bottom: 18px;
          }

          .workerBlockBadge {
            width: 56px;
            height: 56px;
          }

          .workerBlockTitle {
            font-size: 24px;
          }

          .workerBlockSub {
            font-size: 16px;
          }

          .workerCardsGrid,
          .workerRequestGrid {
            grid-template-columns: 1fr;
          }

          .workerSectionLabelRow,
          .workerDateGrid {
            grid-template-columns: 1fr;
          }

          .workerMainCta,
          .workerSendBtn {
            font-size: 18px;
            height: 66px;
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
                    background: "linear-gradient(180deg, #38BCBC 0%, #27B2B2 100%)",
                    color: "#ffffff",
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
                      personalizado
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
                    background: "linear-gradient(180deg, #349AF0 0%, #2987DA 100%)",
                    color: "#ffffff",
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
                Motivo o comentario <span style={{ color: "#7E8AA5", fontWeight: 600 }}>(opcional)</span>
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