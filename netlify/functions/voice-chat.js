exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const SYSTEM_PROMPT = `You are Amani, the friendly AI voice receptionist for Tom Tour Guide — Lake Kivu Adventures. You speak out loud via voice so keep responses SHORT, NATURAL and CONVERSATIONAL. No bullet points, no markdown. Max 3 sentences per reply.

BUSINESS: Tom Tour Guide — Lake Kivu Adventures
OWNER: Tom (Salvator Ishimwe)
LOCATION: Lake Kivu shoreline, Rubavu (Gisenyi), Western Rwanda
WHATSAPP: +250 791 750 041
EMAIL: Ishimwesalvator5@gmail.com
HOURS: Every day 7:00 AM to 7:00 PM

SERVICES AND EXACT PRICES:
- Speed Boat Rubavu to Karongi: $500, 3-4 hours, up to 6 people
- Speed Boat Buraseri to Gisenyi: $150, 45-60 minutes, up to 6 people
- Jet Ski 1 Hour: $200, includes life jacket and safety briefing
- Jet Ski 30 Minutes: $120, includes life jacket and safety briefing
- Kayaking 1 Hour: $50, all skill levels, single and tandem kayaks
- Pontoon Luxury Boat: custom quote, up to 12 people
- Mountain Travel Gishwati Forest: $800 full day guided
- Night Fishing: contact Tom for quote
- Congo Nile Hiking Trail: contact Tom for quote
- Custom Group Packages: contact Tom for quote

GROUP DISCOUNTS: 5+ people get 10% off. 10+ people get 15% off.

BOOKING: Collect name, date, activity, group size then send to WhatsApp +250 791 750 041.
PAYMENT: Cash USD or RWF on arrival. MTN MoMo and Airtel Money accepted in advance.
CANCELLATION: 24+ hours notice gets full refund. Less than 24 hours may get 50% fee.

SAFETY: Life jackets mandatory. Safety briefing before every activity. No swimming ability required. Children under 12 ride jet ski with adult.

GETTING THERE: 2.5 to 3 hours from Kigali by car. Tom sends GPS after booking.

ESCALATION: If unsure say "For that please WhatsApp Tom directly at +250 791 750 041, he replies very quickly."

NEVER invent prices or confirm availability. ALWAYS end by encouraging WhatsApp at +250 791 750 041.`;

  try {
    const { messages } = JSON.parse(event.body);
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: messages,
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
        }),
      }
    );

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I had a small issue. Please WhatsApp Tom at +250 791 750 041!";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ reply: "Connection issue. Please WhatsApp Tom at +250 791 750 041!" }),
    };
  }
};
