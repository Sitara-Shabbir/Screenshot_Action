import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

/* =========================================================
   CONFIGURATION
========================================================= */

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is missing from .env.local"
  );
}

const ai = new GoogleGenAI({
  apiKey,
});

/*
  Keep this limit reasonable because screenshots are sent
  from the browser to this API route.

  10 MB is also the limit shown in the frontend.
*/
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];


/* =========================================================
   AI RESPONSE SCHEMA
========================================================= */

const analysisSchema = {
  type: Type.OBJECT,

  properties: {
    type: {
      type: Type.STRING,

      enum: [
        "TASK",
        "EVENT",
        "DEADLINE",
        "REMINDER",
        "INFORMATION",
      ],

      description:
        "The single category that best represents the main purpose of the screenshot.",
    },

    title: {
      type: Type.STRING,

      description:
        "A short, clear title describing the main information or action.",
    },

    description: {
      type: Type.STRING,

      description:
        "A concise explanation of the important context visible in the screenshot.",
    },

    date: {
      type: Type.STRING,

      description:
        "The relevant date if explicitly present. Return an empty string if no date is visible.",
    },

    time: {
      type: Type.STRING,

      description:
        "The relevant time if explicitly present. Return an empty string if no time is visible.",
    },

    source: {
      type: Type.STRING,

      description:
        "The platform or source where the information appears, such as WhatsApp, Email, SMS, Calendar, Website, Instagram, or Unknown.",
    },

    urgency: {
      type: Type.STRING,

      enum: [
        "low",
        "medium",
        "high",
      ],

      description:
        "How urgent the detected action or information is.",
    },

    action: {
      type: Type.STRING,

      description:
        "The recommended next action. Return an empty string when no action is required.",
    },

    requiredItems: {
      type: Type.ARRAY,

      items: {
        type: Type.STRING,
      },

      description:
        "Items that must be brought, prepared, submitted, attached, or completed. Return an empty array if there are none.",
    },

    confidence: {
      type: Type.NUMBER,

      minimum: 0,
      maximum: 1,

      description:
        "Confidence from 0 to 1 representing how clearly the screenshot supports the classification and extracted information.",
    },
  },

  required: [
    "type",
    "title",
    "description",
    "date",
    "time",
    "source",
    "urgency",
    "action",
    "requiredItems",
    "confidence",
  ],
};


/* =========================================================
   POST /api/analyze
========================================================= */

export async function POST(
  request: Request
) {
  try {
    /* -------------------------------------------------------
       Parse request
    ------------------------------------------------------- */

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error:
            "Invalid request body. Expected JSON.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof body !== "object" ||
      body === null
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request body.",
        },
        {
          status: 400,
        }
      );
    }

    const requestBody =
      body as {
        image?: unknown;
        mimeType?: unknown;
      };

    const image =
      requestBody.image;

    const mimeType =
      requestBody.mimeType;


    /* -------------------------------------------------------
       Validate image
    ------------------------------------------------------- */

    if (
      typeof image !== "string" ||
      image.trim().length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Image data is required.",
        },
        {
          status: 400,
        }
      );
    }


    /* -------------------------------------------------------
       Validate MIME type
    ------------------------------------------------------- */

    if (
      typeof mimeType !== "string" ||
      !ALLOWED_MIME_TYPES.includes(
        mimeType
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Unsupported image type. Please upload PNG, JPG, JPEG, or WEBP.",
        },
        {
          status: 400,
        }
      );
    }


    /* -------------------------------------------------------
       Validate approximate image size
    ------------------------------------------------------- */

    /*
      Base64 is approximately 4/3 the size of the
      original binary file.

      This prevents unnecessarily huge requests.
    */

    const estimatedSize =
      Math.floor(
        (image.length * 3) / 4
      );

    if (
      estimatedSize >
      MAX_IMAGE_SIZE
    ) {
      return NextResponse.json(
        {
          error:
            "Image is too large. Maximum size is 10 MB.",
        },
        {
          status: 413,
        }
      );
    }


    /* =======================================================
       AI PROMPT
    ======================================================= */

    const prompt = `
You are the AI engine for an application called
"Screenshot → Action".

Your task is to analyze the provided screenshot and extract
useful information that can be turned into an actionable result.

Think carefully about the visible text, dates, times, requests,
instructions, events, deadlines, reminders, and context.

Do NOT invent information.

Only extract information that is supported by the screenshot.


CLASSIFICATION
--------------

Classify the screenshot into EXACTLY ONE of:

TASK
EVENT
DEADLINE
REMINDER
INFORMATION


TASK
----

Use TASK when the user needs to perform an action.

Examples:

- Send a report
- Reply to a message
- Submit an assignment
- Call someone
- Upload a document


EVENT
-----

Use EVENT when something is scheduled to happen at a particular
date or time.

Examples:

- Meeting
- Interview
- Class
- Appointment
- Flight


DEADLINE
--------

Use DEADLINE when something must be completed by a specific
date or time.

Examples:

- Assignment due Friday
- Application closes September 12
- Registration ends tomorrow
- Payment deadline Monday


REMINDER
--------

Use REMINDER when the screenshot contains something the user
should remember but it is not clearly a task, event, or deadline.

Examples:

- Remember to bring your charger
- Don't forget your documents
- Office closed tomorrow


INFORMATION
-----------

Use INFORMATION when the screenshot contains useful information
but there is no clear action required.

Examples:

- General announcement
- Product information
- News
- Status update


EXTRACTION RULES
----------------

TITLE

Create a short and useful title.

DESCRIPTION

Summarize the important context without inventing information.

DATE

Extract a date only when one is visible or clearly stated.

If there is no date, return an empty string.

TIME

Extract a time only when one is visible or clearly stated.

If there is no time, return an empty string.

SOURCE

Identify the likely source.

Examples:

WhatsApp
Email
SMS
Calendar
Website
Instagram
Facebook
Messenger
Unknown

If the source cannot reasonably be determined,
use "Unknown".

URGENCY

Choose exactly one:

low
medium
high

Use HIGH when:

- There is an imminent deadline.
- The screenshot explicitly indicates urgency.
- An important action needs immediate attention.
- A submission or response is due very soon.

Use MEDIUM when:

- The action is important.
- There is a meaningful deadline.
- The task requires attention but is not immediately urgent.

Use LOW when:

- There is little time pressure.
- The information is informational.
- The action can reasonably wait.


ACTION

Describe the most useful next step.

Examples:

"Send the project report"
"Attend the interview"
"Submit the application"
"Reply to the message"
"Bring the required documents"

For INFORMATION where no action is necessary,
return an empty string.


REQUIRED ITEMS

Return a list of things the user needs to:

- bring
- prepare
- submit
- attach
- complete

Examples:

[
  "ID card",
  "Updated CV"
]

If there are no required items,
return an empty array.


CONFIDENCE

Return a number between 0 and 1.

Use higher confidence when:

- Text is clearly visible.
- The classification is obvious.
- Date/time information is explicit.
- The source is clear.

Use lower confidence when:

- Text is difficult to read.
- Context is ambiguous.
- Classification is uncertain.
- Important information is partially hidden.


IMPORTANT
---------

Never invent names, dates, times, deadlines, locations,
requirements, or actions.

If information is not visible or supported,
return an empty string or empty array as appropriate.

The result must follow the provided JSON schema exactly.
`;


    /* =======================================================
       GEMINI REQUEST
    ======================================================= */

    const response =
      await ai.models.generateContent({
        model:
          "gemini-2.5-flash",

        contents: [
          {
            inlineData: {
              mimeType,
              data: image,
            },
          },

          {
            text: prompt,
          },
        ],

        config: {
          /*
            Force Gemini to return JSON matching our schema.

            This is much safer than asking the model to
            "please return JSON" inside the prompt.
          */
          responseMimeType:
            "application/json",

          responseSchema:
            analysisSchema,

          /*
            Lower temperature makes extraction more
            consistent and less creative.
          */
          temperature: 0.1,

          /*
            Prevent unnecessarily long responses.
          */
          maxOutputTokens: 1000,
        },
      });


    /* =======================================================
       EXTRACT RESPONSE
    ======================================================= */

    const text =
      response.text?.trim();


    if (!text) {
      return NextResponse.json(
        {
          error:
            "The AI returned an empty response.",
        },
        {
          status: 502,
        }
      );
    }


    /* =======================================================
       VALIDATE JSON
    ======================================================= */

    let parsedResult: unknown;

    try {
      parsedResult =
        JSON.parse(text);
    } catch {
      console.error(
        "Gemini returned invalid JSON:",
        text
      );

      return NextResponse.json(
        {
          error:
            "The AI returned invalid JSON.",
        },
        {
          status: 502,
        }
      );
    }


    /* =======================================================
       BASIC SERVER-SIDE VALIDATION
    ======================================================= */

    if (
      typeof parsedResult !==
        "object" ||
      parsedResult === null
    ) {
      return NextResponse.json(
        {
          error:
            "The AI returned an invalid result.",
        },
        {
          status: 502,
        }
      );
    }

    const result =
      parsedResult as Record<
        string,
        unknown
      >;


    const allowedTypes = [
      "TASK",
      "EVENT",
      "DEADLINE",
      "REMINDER",
      "INFORMATION",
    ];

    const allowedUrgencies = [
      "low",
      "medium",
      "high",
    ];


    if (
      typeof result.type !==
        "string" ||
      !allowedTypes.includes(
        result.type
      )
    ) {
      return NextResponse.json(
        {
          error:
            "AI returned an invalid classification.",
        },
        {
          status: 502,
        }
      );
    }


    if (
      typeof result.urgency !==
        "string" ||
      !allowedUrgencies.includes(
        result.urgency
      )
    ) {
      return NextResponse.json(
        {
          error:
            "AI returned an invalid urgency value.",
        },
        {
          status: 502,
        }
      );
    }


    if (
      typeof result.confidence !==
        "number" ||
      result.confidence < 0 ||
      result.confidence > 1
    ) {
      return NextResponse.json(
        {
          error:
            "AI returned an invalid confidence value.",
        },
        {
          status: 502,
        }
      );
    }


    if (
      !Array.isArray(
        result.requiredItems
      )
    ) {
      return NextResponse.json(
        {
          error:
            "AI returned invalid required items.",
        },
        {
          status: 502,
        }
      );
    }


    /* =======================================================
       SUCCESS
    ======================================================= */

    return NextResponse.json({
      success: true,
      result: JSON.stringify(
        result
      ),
    });

  } catch (error) {

    console.error(
      "Gemini analysis error:",
      error
    );


    /* -------------------------------------------------------
       Friendly error messages
    ------------------------------------------------------- */

    let errorMessage =
      "Something went wrong while analyzing the screenshot.";

    if (
      error instanceof Error
    ) {
      errorMessage =
        error.message;
    }


    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}