import { ImageResponse } from "next/og";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "MarketSims";
  const yes = searchParams.get("yes") || "";
  const no = searchParams.get("no") || "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#3b82f6",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 900,
              fontSize: "18px",
            }}
          >
            M
          </div>
          <span style={{ fontSize: "24px", fontWeight: 700, color: "#18181b" }}>
            MarketSims
          </span>
        </div>

        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            color: "#18181b",
            textAlign: "center",
            lineHeight: 1.3,
            maxWidth: "900px",
          }}
        >
          {title}
        </div>

        {yes && no && (
          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "30px",
            }}
          >
            <div
              style={{
                backgroundColor: "#dcfce7",
                borderRadius: "12px",
                padding: "12px 32px",
                fontSize: "24px",
                fontWeight: 700,
                color: "#15803d",
              }}
            >
              Yes {yes}%
            </div>
            <div
              style={{
                backgroundColor: "#fef2f2",
                borderRadius: "12px",
                padding: "12px 32px",
                fontSize: "24px",
                fontWeight: 700,
                color: "#dc2626",
              }}
            >
              No {no}%
            </div>
          </div>
        )}

        <div
          style={{
            marginTop: "30px",
            fontSize: "18px",
            color: "#a1a1aa",
          }}
        >
          Practice prediction markets with virtual money
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
