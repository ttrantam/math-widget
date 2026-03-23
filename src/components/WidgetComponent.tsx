import "../index.css";

import { useWidgetParams, useSubmission, Speak } from "@moly-edu/widget-sdk";
import type { WidgetParams, WidgetAnswer } from "../definition";
import { useState, useMemo } from "react";

interface NumberItem {
  id: string;
  value: number;
}

export function WidgetComponent() {
  const params = useWidgetParams<WidgetParams>();

  const { numbers, correctOrder } = useMemo(() => {
    const items: number[] = [];
    const seen = new Set<number>();

    while (items.length < params.numberOfItems) {
      const val = Math.floor(
        Math.random() * (params.rangeSettings.maxValue - params.rangeSettings.minValue + 1)
      ) + params.rangeSettings.minValue;

      if (!seen.has(val)) {
        seen.add(val);
        items.push(val);
      }
    }

    const sorted =
      params.orderDirection === "ascending"
        ? [...items].sort((a, b) => a - b)
        : [...items].sort((a, b) => b - a);

    const shuffled = [...items].sort(() => Math.random() - 0.5);

    const numberItems: NumberItem[] = shuffled.map((val) => ({
      id: `num-${val}-${Math.random().toString(36).substring(7)}`,
      value: val,
    }));

    const correctOrderStr = sorted.map((v) => {
      const item = numberItems.find((n) => n.value === v);
      return item?.id;
    }).join(",");

    return { numbers: numberItems, correctOrder: correctOrderStr };
  }, [params.numberOfItems, params.rangeSettings.minValue, params.rangeSettings.maxValue, params.orderDirection]);

  const {
    setAnswer,
    result,
    submit,
    isLocked,
    canSubmit,
    isSubmitting,
  } = useSubmission<WidgetAnswer>({
    evaluate: (ans) => {
      const isCorrect = ans.order === correctOrder;
      return {
        isCorrect,
        score: isCorrect ? 100 : 0,
        maxScore: 100,
      };
    },
  });

  const [items, setItems] = useState<NumberItem[]>(numbers);
  const [draggedItem, setDraggedItem] = useState<NumberItem | null>(null);

  const handleDragStart = (item: NumberItem) => {
    if (isLocked) return;
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: NumberItem) => {
    e.preventDefault();
    if (isLocked || !draggedItem || draggedItem.id === targetItem.id) return;

    const draggedIdx = items.findIndex((i) => i.id === draggedItem.id);
    const targetIdx = items.findIndex((i) => i.id === targetItem.id);

    const newItems = [...items];
    newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedItem);

    setItems(newItems);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    const orderStr = items.map((i) => i.id).join(",");
    setAnswer({ order: orderStr });
  };

  const handleTouchStart = (item: NumberItem) => {
    if (isLocked) return;
    setDraggedItem(item);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (targetItem: NumberItem) => {
    if (isLocked || !draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    const draggedIdx = items.findIndex((i) => i.id === draggedItem.id);
    const targetIdx = items.findIndex((i) => i.id === targetItem.id);

    const newItems = [...items];
    newItems.splice(draggedIdx, 1);
    newItems.splice(targetIdx, 0, draggedItem);

    setItems(newItems);
    setDraggedItem(null);

    const orderStr = newItems.map((i) => i.id).join(",");
    setAnswer({ order: orderStr });
  };

  const orderText =
    params.orderDirection === "ascending" ? "tăng dần" : "giảm dần";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-cyan-50">
      <div className="w-full max-w-lg">
        {isLocked && <ReviewBadge />}

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-200">
          <div className="text-center mb-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-3">
              Sắp xếp số
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              <Speak>{params.question}</Speak>
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              <Speak text={`Sắp xếp theo thứ tự ${orderText}`}>
                Thứ tự: <strong>{orderText}</strong>
              </Speak>
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const isDragging = draggedItem?.id === item.id;
              return (
                <div
                  key={item.id}
                  draggable={!isLocked}
                  onDragStart={() => handleDragStart(item)}
                  onDragOver={(e) => handleDragOver(e, item)}
                  onDragEnd={handleDragEnd}
                  onTouchStart={() => handleTouchStart(item)}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={() => handleTouchEnd(item)}
                  className={`
                    flex items-center justify-center
                    py-4 px-6 rounded-xl text-3xl font-bold
                    border-2 transition-all
                    ${
                      isDragging
                        ? "opacity-50 scale-95 border-blue-400 bg-blue-50"
                        : "opacity-100 scale-100 border-slate-300 bg-white"
                    }
                    ${
                      isLocked
                        ? "cursor-default"
                        : "cursor-move hover:border-blue-400 hover:shadow-md active:scale-95"
                    }
                  `}
                >
                  <span className="text-slate-800">{item.value}</span>
                </div>
              );
            })}
          </div>

          {!isLocked && (
            <button
              onClick={submit}
              disabled={!canSubmit || isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed
                text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {isSubmitting ? "Đang nộp..." : "Nộp bài"}
            </button>
          )}

          <Feedback
            result={result}
            isLocked={isLocked}
            params={params}
            correctOrder={correctOrder}
            numbers={numbers}
          />
        </div>
      </div>
    </div>
  );
}

function ReviewBadge() {
  return (
    <div className="mb-4 text-center">
      <span className="inline-block px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        Chế độ xem lại
      </span>
    </div>
  );
}

function Feedback({
  result,
  isLocked,
  params,
  correctOrder,
  numbers,
}: {
  result: { isCorrect: boolean } | null;
  isLocked: boolean;
  params: WidgetParams;
  correctOrder: string;
  numbers: NumberItem[];
}) {
  if (!result || !isLocked) return null;
  if (!params.feedback.showFeedback) return null;

  const correctValues = correctOrder.split(",").map((id) => {
    const item = numbers.find((n) => n.id === id);
    return item?.value;
  });

  return (
    <div
      className={`p-4 rounded-xl mt-4 border-2 text-center ${
        result.isCorrect
          ? "bg-green-50 border-green-200"
          : "bg-red-50 border-red-200"
      }`}
    >
      <div className="text-3xl mb-1">{result.isCorrect ? "🎉" : "💪"}</div>
      <div
        className={`text-lg font-bold ${
          result.isCorrect ? "text-green-700" : "text-red-700"
        }`}
      >
        <Speak>
          {result.isCorrect
            ? params.feedback.feedbackCorrect
            : params.feedback.feedbackIncorrect}
        </Speak>
      </div>
      {!result.isCorrect && (
        <div className="text-sm text-slate-500 mt-2">
          Thứ tự đúng: <strong>{correctValues.join(", ")}</strong>
        </div>
      )}
    </div>
  );
}
