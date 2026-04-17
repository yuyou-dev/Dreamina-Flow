import { describe, expect, it } from "vitest";
import {
  WORKFLOW_SCHEMA,
  buildWorkflowDownloadPayload,
  createDefaultParams,
  prepareStarterWorkflowDocument,
  prepareWorkflowDocumentImport,
  type AdapterStatus,
  type NodeDefinition,
} from "../src/index.js";

const definitions: Record<string, NodeDefinition> = {
  input_text: {
    name: "input_text",
    title: "Input: Text",
    category: "input",
    description: "Text input.",
    inputs: [],
    outputs: [{ id: "text", label: "Text", type: "text" }],
    params: [],
    defaults: {},
    outputMode: "text",
    wrapperAvailable: false,
    rawCliAvailable: false,
    constraints: {},
    warnings: [],
  },
  text2image: {
    name: "text2image",
    title: "Text to Image",
    category: "processor",
    description: "Processor node.",
    inputs: [{ id: "prompt", label: "Prompt", type: "text", required: true }],
    outputs: [{ id: "image", label: "Image", type: "image" }],
    params: [
      { key: "ratio", label: "Ratio", type: "select", choices: ["1:1", "16:9"], default: "1:1" },
      { key: "resolution_type", label: "Resolution", type: "select", choices: ["1k", "2k"], default: "2k" },
      { key: "model_version", label: "Model", type: "select", choices: ["3.0", "3.1"], default: "3.1" },
      { key: "poll", label: "Poll", type: "number", default: 300 },
    ],
    defaults: { ratio: "1:1", resolution_type: "2k", model_version: "3.1", poll: 300 },
    outputMode: "json",
    wrapperAvailable: true,
    rawCliAvailable: true,
    constraints: {
      resolutionRules: {
        "1k": ["3.0", "3.1"],
        "2k": ["3.0", "3.1"],
      },
    },
    warnings: [],
  },
  output_image: {
    name: "output_image",
    title: "Display: Image",
    category: "output",
    description: "Image output.",
    inputs: [{ id: "image", label: "Image", type: "image", required: true }],
    outputs: [],
    params: [],
    defaults: {},
    outputMode: "image",
    wrapperAvailable: false,
    rawCliAvailable: false,
    constraints: {},
    warnings: [],
  },
};

const status: AdapterStatus = {
  backendReady: true,
  cliFound: true,
  cliPath: "/usr/local/bin/dreamina",
  cliVersion: "1.0.0",
  wrapperVersion: 42,
  adapterName: "dreamina",
  logDirectory: "/tmp/logs",
  auth: {
    loggedIn: true,
    credits: {
      vipCredit: 0,
      giftCredit: 100,
      purchaseCredit: 0,
      totalCredit: 100,
    },
    lastCheckedAt: "2026-04-13T00:00:00.000Z",
    message: null,
  },
};
const LEGACY_SCHEMA = ["dreamina", "workflow/v1alpha1"].join(".");

describe("workflow-core", () => {
  it("boots a starter workflow and round-trips through export/import", () => {
    const starter = prepareStarterWorkflowDocument(definitions, status);
    expect(starter.ok).toBe(true);
    if (!starter.ok) {
      return;
    }

    const payload = buildWorkflowDownloadPayload({
      nodes: starter.workflow.nodes,
      edges: starter.workflow.edges,
      meta: starter.workflow.meta,
      groups: starter.workflow.groups,
      viewport: starter.workflow.viewport,
      definitions,
      status,
    });

    expect(payload.document.schema).toBe(WORKFLOW_SCHEMA);
    expect(payload.filename).toBe("starter-text-to-image.workflow.json");

    const imported = prepareWorkflowDocumentImport(JSON.parse(payload.json), definitions, status);
    expect(imported.ok).toBe(true);
    if (!imported.ok) {
      return;
    }

    expect(imported.workflow.nodes.map((node) => node.data.nodeType)).toEqual(["input_text", "text2image", "output_image"]);
  });

  it("rejects the legacy workflow schema", () => {
    const imported = prepareWorkflowDocumentImport(
      {
        schema: LEGACY_SCHEMA,
        version: 1,
        nodes: [],
        edges: [],
      },
      definitions,
      status,
    );

    expect(imported.ok).toBe(false);
    if (imported.ok) {
      return;
    }
    expect(imported.error).toContain("Unsupported workflow schema");
  });

  it("leaves CLI-defaulted text2image fields blank in starter params", () => {
    const cliDefaultedTextToImage: NodeDefinition = {
      ...definitions.text2image,
      params: [
        { key: "ratio", label: "Ratio", type: "select", choices: ["1:1", "16:9"], default: "16:9" },
        { key: "resolution_type", label: "Resolution", type: "select", choices: ["1k", "2k", "4k"] },
        { key: "model_version", label: "Model", type: "select", choices: ["3.0", "3.1", "4.0"] },
        { key: "poll", label: "Poll", type: "number", default: 300 },
      ],
      defaults: { ratio: "16:9", poll: 300 },
      constraints: {
        resolutionRules: {
          "1k": ["3.0", "3.1"],
          "2k": ["3.0", "3.1", "4.0"],
          "4k": ["4.0"],
        },
      },
    };

    expect(createDefaultParams(cliDefaultedTextToImage)).toEqual({
      ratio: "16:9",
      poll: 300,
    });
  });

  it("does not force frames2video video_resolution when the CLI model default should apply", () => {
    const framesToVideo: NodeDefinition = {
      name: "frames2video",
      title: "Frames to Video",
      category: "processor",
      description: "Processor node.",
      inputs: [
        { id: "first", label: "First", type: "image", required: true },
        { id: "last", label: "Last", type: "image", required: true },
        { id: "prompt", label: "Prompt", type: "text", required: true },
      ],
      outputs: [{ id: "video", label: "Video", type: "video" }],
      params: [
        { key: "duration", label: "Duration", type: "number", default: 5 },
        { key: "video_resolution", label: "Resolution", type: "select", choices: ["720p", "1080p"] },
        { key: "model_version", label: "Model", type: "select", choices: ["3.0", "seedance2.0fast"], default: "seedance2.0fast" },
        { key: "poll", label: "Poll", type: "number", default: 1800 },
      ],
      defaults: { duration: 5, model_version: "seedance2.0fast", poll: 1800 },
      outputMode: "json",
      wrapperAvailable: true,
      rawCliAvailable: true,
      constraints: {
        modelRules: {
          "3.0": { duration: [3, 10], video_resolution: ["720p", "1080p"] },
          "seedance2.0fast": { duration: [4, 15], video_resolution: ["720p"] },
        },
      },
      warnings: [],
    };

    expect(createDefaultParams(framesToVideo)).toEqual({
      duration: 5,
      model_version: "seedance2.0fast",
      poll: 1800,
    });
  });
});
