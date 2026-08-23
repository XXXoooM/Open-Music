import { useActionState } from "react";
import { X, ListPlus, Sparkles } from "lucide-react";
import { usePlaylistStore } from "@/stores/playlistStore";

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CreateFormState {
  error: string | null;
  success: boolean;
}

export const CreatePlaylistModal = ({ isOpen, onClose }: CreatePlaylistModalProps) => {
  const { createPlaylist, setActiveView } = usePlaylistStore();

  const [_state, formAction, isPending] = useActionState<CreateFormState, FormData>(
    async (_prev, formData) => {
      const title = (formData.get("title") as string)?.trim();
      const description = (formData.get("description") as string)?.trim();

      if (!title) {
        return { error: "请输入歌单名称", success: false };
      }

      const newPl = createPlaylist(title, description);
      setActiveView("playlist-detail", newPl.id);
      onClose();
      return { error: null, success: true };
    },
    { error: null, success: false }
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-3xl p-7 apple-glass border border-white/20 dark:border-white/10 shadow-2xl relative space-y-6">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#fa2d48] to-[#ff758c] mx-auto flex items-center justify-center text-white shadow-lg shadow-[#fa2d48]/25">
            <ListPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
            新建自建歌单
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            创建个性化歌单，随心收藏心仪的单曲与专辑
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-1">
              歌单名称
            </label>
            <input
              type="text"
              name="title"
              required
              placeholder="如：华语流行榜 / 跑步动力歌单"
              className="w-full h-10 px-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 px-1">
              歌单描述 (可选)
            </label>
            <input
              type="text"
              name="description"
              placeholder="简短描述歌单的音乐风格与心情"
              className="w-full h-10 px-3.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:border-[#fa2d48] focus:ring-1 focus:ring-[#fa2d48] text-neutral-900 dark:text-white placeholder:text-neutral-400 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-xl bg-[#fa2d48] hover:bg-[#ff3b56] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#fa2d48]/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> 创建并打开歌单
          </button>
        </form>
      </div>
    </div>
  );
};
