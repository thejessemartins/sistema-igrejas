import { asc, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import {
  surveyAnswers,
  surveyQuestions,
  surveyResponses,
  surveys,
} from "@/db/schema";

export async function getSurveysList() {
  return db
    .select()
    .from(surveys)
    .where(isNull(surveys.deletedAt))
    .orderBy(desc(surveys.createdAt));
}

export async function getSurveyDetail(id: string) {
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, id))
    .limit(1);

  if (!survey || survey.deletedAt) return null;

  const questions = await db
    .select()
    .from(surveyQuestions)
    .where(eq(surveyQuestions.surveyId, id))
    .orderBy(asc(surveyQuestions.position));

  return { survey, questions };
}

export async function getSurveyResults(id: string) {
  const detail = await getSurveyDetail(id);
  if (!detail) return null;

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(eq(surveyResponses.surveyId, id));

  const answers = await db
    .select({
      questionId: surveyAnswers.questionId,
      valueText: surveyAnswers.valueText,
      valuesJson: surveyAnswers.valuesJson,
    })
    .from(surveyAnswers)
    .innerJoin(
      surveyResponses,
      eq(surveyAnswers.responseId, surveyResponses.id)
    )
    .where(eq(surveyResponses.surveyId, id));

  return {
    ...detail,
    totalResponses: responses.length,
    answers,
  };
}
