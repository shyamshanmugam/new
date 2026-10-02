export type SoilInput = {
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  ph: number;
  moisture: number;
  organicMatter: number;
};

export type Recommendation = {
  title: string;
  priority: "High" | "Medium" | "Low";
  actions: string[];
  caution: string;
};
export type Crop = { name: string; score: number; status: string; limits: string };

const crops = [
  ["Rice", [5, 7], [70, 140], [25, 65], [70, 160], 1.2, [20, 45]],
  ["Wheat", [6, 7.5], [70, 140], [30, 70], [80, 170], 1.2, [12, 28]],
  ["Maize", [5.8, 7.2], [70, 145], [30, 70], [80, 170], 1.5, [14, 30]],
  ["Groundnut", [6, 7.2], [35, 100], [30, 70], [85, 180], 1, [10, 25]],
  ["Cotton", [5.8, 8], [60, 135], [30, 70], [85, 180], 1, [12, 28]],
  ["Potato", [5, 6.5], [75, 150], [35, 75], [90, 190], 2, [14, 30]],
  ["Chickpea", [6, 8], [35, 105], [30, 70], [80, 170], 1, [8, 22]],
  ["Pearl millet", [5.5, 8], [45, 115], [25, 65], [65, 155], 0.9, [7, 22]],
] as const;

const inRange = (value: number, [min, max]: readonly number[]) => value >= min && value <= max;
const rangeScore = (value: number, [min, max]: readonly number[]) => {
  if (inRange(value, [min, max])) return 1;
  const distance = value < min ? min - value : value - max;
  return Math.max(0, 1 - distance / Math.max(max - min, 1));
};

function nutrientStatus(value: number, low: number, high: number) {
  return value < low ? "Low" : value > high ? "High" : "Adequate";
}

const fertilizerCaution = "Use crop- and district-specific Soil Health Card guidance; do not apply a universal rate from these demonstration bands.";

export function validate(input: SoilInput): string | null {
  if (Object.values(input).some((value) => !Number.isFinite(value) || value < 0)) {
    return "Enter valid non-negative numeric values.";
  }
  if (input.ph > 14) return "pH must be between 0 and 14.";
  if (input.moisture > 100 || input.organicMatter > 100) {
    return "Moisture and organic matter must be percentages from 0 to 100.";
  }
  return null;
}

export function analyze(input: SoilInput) {
  const error = validate(input);
  if (error) throw new Error(error);

  const statuses = {
    nitrogen: nutrientStatus(input.nitrogen, 50, 120),
    phosphorus: nutrientStatus(input.phosphorus, 30, 60),
    potassium: nutrientStatus(input.potassium, 80, 150),
    ph: input.ph < 5.5 ? "Acidic" : input.ph > 7.5 ? "Alkaline" : "Near neutral",
    organicMatter: input.organicMatter < 1 ? "Very low" : input.organicMatter < 1.5 ? "Low" : "Adequate",
    moisture: input.moisture < 10 ? "Dry" : input.moisture > 30 ? "Wet" : "Adequate",
  };

  const components = [
    rangeScore(input.nitrogen, [50, 120]),
    rangeScore(input.phosphorus, [30, 60]),
    rangeScore(input.potassium, [80, 150]),
    rangeScore(input.ph, [6.5, 7.5]),
    rangeScore(input.organicMatter, [1.5, 3]),
    rangeScore(input.moisture, [10, 30]),
  ];
  const score = Math.round(components.reduce((sum, component) => sum + component, 0) / components.length * 100);
  const grade = score >= 85 ? "Good" : score >= 70 ? "Fair" : score >= 50 ? "Needs improvement" : "Poor";
  const recommendations: Recommendation[] = [];

  const nutrientRecommendations = [
    {
      value: statuses.nitrogen,
      low: {
        title: "Nitrogen management",
        priority: "High" as const,
        actions: [
          "Confirm the crop-specific nitrogen dose using the soil-test report and local Soil Health Card.",
          "Split nitrogen applications to match crop demand and reduce avoidable losses.",
          "Use composted manure, legumes or green manure where suitable.",
        ],
        caution: fertilizerCaution,
      },
      high: "nitrogen",
    },
    {
      value: statuses.phosphorus,
      low: {
        title: "Phosphorus management",
        priority: "High" as const,
        actions: [
          "Confirm the crop-specific phosphorus dose from the Soil Health Card or local extension service.",
          "Use locally recommended basal placement near the root zone.",
          "Maintain organic matter and suitable crop residues.",
        ],
        caution: "Phosphorus interpretation depends on the laboratory extraction method and local calibration.",
      },
      high: "phosphorus",
    },
    {
      value: statuses.potassium,
      low: {
        title: "Potassium management",
        priority: "High" as const,
        actions: [
          "Confirm the crop-specific potassium dose from the Soil Health Card or local extension service.",
          "Apply at the crop stage and placement advised locally.",
          "Return suitable crop residues to the soil.",
        ],
        caution: fertilizerCaution,
      },
      high: "potassium",
    },
  ];

  for (const nutrient of nutrientRecommendations) {
    if (nutrient.value === "Low") recommendations.push(nutrient.low);
    if (nutrient.value === "High") {
      recommendations.push({
        title: `Avoid extra ${nutrient.high}`,
        priority: "Medium",
        actions: [
          `Review the soil test and crop plan before adding ${nutrient.high}.`,
          `Avoid routine ${nutrient.high} application until the recommendation is confirmed.`,
        ],
        caution: "A high test value is not, by itself, a diagnosis of toxicity.",
      });
    }
  }

  if (input.ph < 5.5) recommendations.push({
    title: "Acid soil management",
    priority: "High",
    actions: [
      "Request lime-requirement or buffer-pH testing before selecting an application rate.",
      "Use agricultural lime or dolomite only at a locally recommended rate.",
      "Consider locally adapted acid-tolerant crops while soil constraints are addressed.",
    ],
    caution: "Do not estimate a lime rate from pH alone; soil texture and buffer capacity matter.",
  });
  if (input.ph > 7.5) recommendations.push({
    title: "Alkaline soil assessment",
    priority: "High",
    actions: [
      "Check electrical conductivity, sodicity and irrigation-water quality before selecting an amendment.",
      "Consult a local soil laboratory or extension service for a field-specific plan.",
      "Maintain organic inputs where appropriate.",
    ],
    caution: "High pH alone does not establish sodicity or identify the correct amendment.",
  });
  if (input.organicMatter < 1.5) recommendations.push({
    title: "Build organic matter",
    priority: "Medium",
    actions: [
      "Use mature compost or well-decomposed manure where suitable.",
      "Add green manure, cover crops or legumes when the rotation allows.",
      "Avoid unnecessary residue burning.",
    ],
    caution: "Account for nutrients in organic inputs and follow local nutrient-management guidance.",
  });
  if (input.moisture < 10) recommendations.push({
    title: "Conserve soil moisture",
    priority: "Medium",
    actions: ["Use mulch and schedule irrigation according to crop stage, soil texture and weather."],
    caution: "A single moisture reading does not represent seasonal field water availability.",
  });
  if (input.moisture > 30) recommendations.push({
    title: "Review excess wetness",
    priority: "Medium",
    actions: ["Check drainage, irrigation timing and compaction before adding fertilizer."],
    caution: "A single moisture reading does not represent seasonal field water availability.",
  });
  if (!recommendations.length) recommendations.push({
    title: "Maintain balanced soil management",
    priority: "Low",
    actions: ["Continue crop-specific soil-test planning and periodic testing."],
    caution: "This prototype does not assess micronutrients, salinity, pests or disease.",
  });

  const cropResults: Crop[] = crops.map(([name, ph, n, p, k, organicMatter, moisture]) => {
    const factors = {
      pH: rangeScore(input.ph, ph),
      N: rangeScore(input.nitrogen, n),
      P: rangeScore(input.phosphorus, p),
      K: rangeScore(input.potassium, k),
      "organic matter": rangeScore(input.organicMatter, [organicMatter, 3]),
      moisture: rangeScore(input.moisture, moisture),
    };
    const score = Math.round((
      factors.pH * 0.30 +
      factors.N * 0.12 +
      factors.P * 0.12 +
      factors.K * 0.12 +
      factors["organic matter"] * 0.16 +
      factors.moisture * 0.18
    ) * 100);
    const limits = Object.entries(factors)
      .filter(([, value]) => value < 0.99)
      .map(([factor]) => factor)
      .join(", ") || "No demonstrated limitation";
    return {
      name,
      score,
      status: score >= 75 ? "Suitable" : score >= 55 ? "Suitable after improvement" : "Lower suitability",
      limits,
    };
  }).sort((a, b) => b.score - a.score).slice(0, 5);

  return { score, grade, statuses, recommendations, crops: cropResults };
}
