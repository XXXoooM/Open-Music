import { useActionState } from "react";
import { X, Lock, Mail, Apple, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ActionFormState {
  error: string | null;
  success: boolean;
}

export const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const { login } = useAuthStore();

  // React 19 useActionState for form handling
  const [state, formAction, isPending] = useActionState<ActionFormState, FormData>(
    async (_prevState, formData) => {
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      if (!email || !password) {
        return { error: "请输入完整的 Apple ID 与密码", success: false };
      }

      // Simulate Authentication request with backend
      await new Promise((res) => setTimeout(res, 800));

      if (password.length < 6) {
        return { error: "密码长度不能少于 6 位", success: false };
      }

      login("mock-token-" + Date.now(), {
        id: "usr-" + Math.floor(Math.random() * 10000),
        nickname: email.split("@")[0] || "Apple Music 贵宾",
        email,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
        membership: "apple-music-plus",
        joinedAt: new Date().toISOString(),
      });

      setTimeout(() => {
        onClose();
      }, 500);

      return { error: null, success: true };
    },
    { error: null, success: false }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl p-7 apple-glass border border-white/20 dark:border-white/10 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fa2d48] to-[#ff758c] mx-auto flex items-center justify-center text-white shadow-lg shadow-[#fa2d48]/25">
            <Apple className="w-6 h-6 fill-current" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            登录 Apple ID
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            登录以同步您的云端音乐资料库与自建歌单
          </p>
        </div>

        {/* Feedback Alerts */}
        {state.error && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{state.error}</span>
          </div>
        )}

        {state.success && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>认证成功，正在同步云端资料库...</span>
          </div>
        )}

        {/* React 19 Action Form */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-1">
              Apple ID 邮箱
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                placeholder="example@icloud.com"
                defaultValue="developer@apple.com"
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-1">
              密码
            </label>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 pointer-events-none" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                defaultValue="AppleSpatial123"
                className="w-full h-10 pl-10 pr-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-xl bg-[#fa2d48] hover:bg-[#ff3b56] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#fa2d48]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                正在安全认证...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> 登录并同步
              </span>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-neutral-400">
          受 Apple 端到端加密与隐私保护技术支持
        </div>
      </div>
    </div>
  );
};
