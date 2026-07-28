import Image from "next/image";

export type DogdanEmotion = "idle" | "thinking" | "success" | "error";

interface DogdanAvatarProps {
  emotion?: DogdanEmotion;
  size?: "small" | "medium" | "large";
  label?: string;
}

const emotionLabels: Record<DogdanEmotion, string> = {
  idle: "狗蛋正在陪你学习",
  thinking: "狗蛋正在思考",
  success: "狗蛋正在庆祝学习成果",
  error: "狗蛋正在帮你排查问题",
};

export function DogdanAvatar({ emotion = "idle", size = "medium", label }: DogdanAvatarProps) {
  return (
    <div className={`dogdan-avatar ${size}`} data-emotion={emotion} aria-label={label ?? emotionLabels[emotion]}>
      <span className="dogdan-avatar-aura" aria-hidden="true" />
      <Image
        alt="原创机器人宠物狗角色——狗蛋 Agent"
        className="dogdan-avatar-image"
        height={520}
        priority={size === "large"}
        src="/mascot/goudan-agent.png"
        width={520}
      />
      <span className="dogdan-emotion-mark" aria-hidden="true">
        {emotion === "thinking" ? "···" : emotion === "success" ? "✦" : emotion === "error" ? "?" : "Hi"}
      </span>
    </div>
  );
}
