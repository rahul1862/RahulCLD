import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Mail, Building2, MapPin, Phone, Clock, FileDown } from "lucide-react";
import { useUser } from "../hooks/useUsers";
import { userService } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ConfirmModal } from "../components/ui/Modal";
import { SkeletonProfile } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";
import Avatar from "../components/ui/Avatar";
import { fmtDate } from "../utils/helpers";

function Field({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-ink-50 dark:border-ink-800/60 last:border-0">
      <div className="mt-0.5 flex-shrink-0 text-ink-300 dark:text-ink-700">
        <Icon size={14} strokeWidth={1.8} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-400 dark:text-ink-600 mb-0.5">{label}</p>
        <p className="text-[13px] text-ink-800 dark:text-ink-200 break-words">{value}</p>
      </div>
    </div>
  );
}

export default function UserDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const toast    = useToast();
  const { user, loading, error } = useUser(id);
  const [delOpen, setDelOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const handleDelete = async () => {
    try {
      await userService.remove(id);
      toast("Person removed", "success");
      navigate("/users");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  const handleDownloadPdf = async () => {
    setPdfBusy(true);
    try {
      await userService.downloadPdf(id, `${user.name.replace(/\s+/g, "_")}-profile.pdf`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <div className="page max-w-lg">
      <Link
        to="/users"
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 dark:text-ink-600 hover:text-ink-700 dark:hover:text-ink-300 transition-colors mb-5 group"
      >
        <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform" />
        People
      </Link>

      {loading && <SkeletonProfile />}
      {error   && <ErrorState message={error} />}

      {user && !loading && (
        <div className="animate-in">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size="lg" />
              <div>
                <h1 className="text-[18px] font-semibold text-ink-900 dark:text-ink-100 leading-snug">
                  {user.name}
                </h1>
                <p className="text-[13px] text-ink-400 dark:text-ink-600">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleDownloadPdf}
                disabled={pdfBusy}
                className="btn-secondary btn-sm"
                aria-label="Download profile as PDF"
              >
                <FileDown size={12} /> {pdfBusy ? "Preparing…" : "PDF"}
              </button>
              <Link to={`/edit/${id}`} className="btn-secondary btn-sm">
                <Pencil size={12} /> Edit
              </Link>
              <button onClick={() => setDelOpen(true)} className="btn-ghost btn-sm text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 size={12} />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl px-4">
            <Field icon={Mail}     label="Email"   value={user.email} />
            <Field icon={Building2} label="Company" value={user.company} />
            <Field icon={MapPin}   label="Address" value={user.address} />
            <Field icon={Phone}  label="Phone"   value={user.phone} />
            <Field icon={Clock}  label="Joined"  value={fmtDate(user.createdAt)} />
          </div>
        </div>
      )}

      {delOpen && (
        <ConfirmModal
          title="Remove person"
          message={`${user?.name} will be permanently deleted. This can't be undone.`}
          onConfirm={handleDelete}
          onClose={() => setDelOpen(false)}
        />
      )}
    </div>
  );
}
