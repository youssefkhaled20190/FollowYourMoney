import React from "react";

const walletStyles = `
  @keyframes slide-in {
    0%   { top: -30px; opacity: 0; transform: translateX(-50%) scale(0.8); }
    10%  { opacity: 1; }
    25%  { top: 18px; transform: translateX(-50%) scale(1); }
    90%  { top: 18px; opacity: 1; }
    100% { top: 18px; opacity: 0; }
  }
  @keyframes wallet-bounce {
    0%, 100% { transform: scale(1); }
    12%  { transform: scale(1.02, 0.98); }
    15%  { transform: scale(1); }
    32%  { transform: scale(1.02, 0.98); }
    35%  { transform: scale(1); }
    52%  { transform: scale(1.02, 0.98); }
    55%  { transform: scale(1); }
  }
  @keyframes wave {
    0%, 60%, 100% { transform: translateY(0); }
    30%            { transform: translateY(-4px); }
  }
  .bill-anim   { animation: slide-in 4s ease-in-out infinite; }
  .bill-1      { animation-delay: 0s; }
  .bill-2      { animation-delay: 0.8s; }
  .bill-3      { animation-delay: 1.6s; }
  .wallet-anim { animation: wallet-bounce 4s ease-in-out infinite; }
  .dot-anim    { display: inline-block; animation: wave 1.5s infinite; }
  .dot-1       { animation-delay: 0s; }
  .dot-2       { animation-delay: 0.1s; }
  .dot-3       { animation-delay: 0.2s; }
`;

export default function WalletLoader({ message = "Loading" }) {
  return (
    <>
      <style>{walletStyles}</style>

      {/* Outer centering wrapper */}
      <div className="flex items-center justify-center w-full h-full min-h-screen bg-white">
        <div className="relative" style={{ width: 110, height: 80 }}>

          {/* Wallet back */}
          <div
            className="absolute rounded-t"
            style={{
              bottom: 10,
              left: 5,
              width: 100,
              height: 45,
              background: "#5a2d0c",
              zIndex: 0,
            }}
          />

          {/* Bills */}
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`bill-anim bill-${n} absolute`}
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                top: -30,
                width: 70,
                height: 40,
                background: "#66cdaa",
                borderRadius: 2,
                border: "1px solid #2e8b57",
                opacity: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: n,
              }}
            >
              {/* Rupee circle */}
              <span
                style={{
                  fontWeight: "bold",
                  fontSize: 18,
                  color: "#2e8b57",
                  border: "2px solid #2e8b57",
                  borderRadius: "50%",
                  width: 22,
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.2)",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                ₹
              </span>
              {/* Dashed border overlay */}
              <span
                style={{
                  position: "absolute",
                  left: 3, right: 3, top: 3, bottom: 3,
                  border: "1px dashed #2e8b57",
                  borderRadius: 1,
                  pointerEvents: "none",
                }}
              />
            </div>
          ))}

          {/* Wallet front */}
          <div
            className="wallet-anim absolute flex items-center justify-center"
            style={{
              bottom: 0,
              left: 0,
              width: 110,
              height: 52,
              background: "linear-gradient(180deg, #8b4513, #5a2d0c)",
              borderRadius: "6px 6px 10px 10px",
              zIndex: 10,
              boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
            }}
          >
            {/* Stitching */}
            <span
              style={{
                position: "absolute",
                left: 6, right: 6, bottom: 6, top: 6,
                border: "1px dashed rgba(60,30,0,0.3)",
                borderRadius: "4px 4px 8px 8px",
                pointerEvents: "none",
              }}
            />
            {/* Loading text */}
            <span
              style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "0.5px",
                textShadow: "0px 1px 1px rgba(0,0,0,0.3)",
                position: "relative",
                zIndex: 1,
              }}
            >
              {message}
              <span className="dot-anim dot-1">.</span>
              <span className="dot-anim dot-2">.</span>
              <span className="dot-anim dot-3">.</span>
            </span>
          </div>

        </div>
      </div>
    </>
  );
}