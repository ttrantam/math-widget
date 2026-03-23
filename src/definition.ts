import {
  defineWidget,
  param,
  folder,
  when,
  type ExtractParams,
  type ExtractAnswer,
} from "@moly-edu/widget-sdk";

export const widgetDefinition = defineWidget({
  parameters: {
    question: param
      .string("Sắp xếp các số sau theo thứ tự tăng dần:")
      .label("Đề bài"),

    orderDirection: param
      .select(["ascending", "descending"] as const, "ascending")
      .label("Thứ tự sắp xếp")
      .description("ascending = Tăng dần, descending = Giảm dần")
      .random(),

    numberOfItems: param
      .number(5)
      .label("Số lượng phần tử")
      .min(3)
      .max(8)
      .random(),

    rangeSettings: folder("Phạm vi số", {
      minValue: param.number(1).label("Giá trị nhỏ nhất").min(0).max(100),
      maxValue: param.number(50).label("Giá trị lớn nhất").min(1).max(100),
    }).expanded(false),

    feedback: folder("Phản hồi", {
      showFeedback: param.boolean(true).label("Hiển thị phản hồi"),
      feedbackCorrect: param
        .string("Chính xác! Bạn đã sắp xếp đúng thứ tự!")
        .label("Khi đúng")
        .visibleIf(when("feedback.showFeedback").equals(true)),
      feedbackIncorrect: param
        .string("Chưa đúng, hãy thử lại!")
        .label("Khi sai")
        .visibleIf(when("feedback.showFeedback").equals(true)),
    }).expanded(false),
  },

  deriveDefaults: (_defaults, { randomInt }) => {
    return {
      numberOfItems: randomInt(3, 6),
    };
  },

  answer: {
    order: param.string("").label("Thứ tự sắp xếp (chuỗi ID phân cách bởi dấu phẩy)"),
  },
});

export type WidgetParams = ExtractParams<typeof widgetDefinition>;
export type WidgetAnswer = ExtractAnswer<typeof widgetDefinition>;
