import { useState, useEffect } from "react";
import { GlowButton, Table, EmptyState, Modal, Skeleton, ButtonLoader } from "../../ui/primitives";
import { Search, Edit2, Trash2, Plus } from "lucide-react";
import { adminLocationService, type LocationData } from "../../../services/adminLocationService";
import { toast } from "../../../store/toastStore";
import { DeleteConfirmationModal } from "../../common/DeleteConfirmationModal";

export function LocationsTab() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState<LocationData>({
    latitude: 0,
    longitude: 0,
    radius: 0,
    address: "",
    gym_open_status: false,
    working_hours_from_time: "09:00",
    working_hours_to_time: "18:00",
    country: "",
    email: "",
    phone: "",
    whatsapp: "",
    facebook_url: "",
    instagram_url: "",
    twitter_url: "",
    linkedin_url: "",
    tiktok_url: "",
    youtube_url: "",
    website_url: "",
  });

  useEffect(() => {
    fetchLocations(page);
  }, [page, search]);

  const fetchLocations = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminLocationService.getLocations({ offset: (p - 1) * 10, count: 10, search });
      setLocations(res.data || []);
      setTotalCount(res.totalcount || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) {
        await adminLocationService.updateLocation(editId, form);
        toast.success("Location updated successfully!");
      } else {
        await adminLocationService.createLocation(form);
        toast.success("Location created successfully!");
      }
      setModalOpen(false);
      fetchLocations(page);
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminLocationService.deleteLocation(deleteId);
      toast.success("Location deleted successfully!");
      setDeleteModalOpen(false);
      fetchLocations(page);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete location.");
    }
  };

  const resetForm = () => {
    setForm({
      latitude: 0,
      longitude: 0,
      radius: 0,
      address: "",
      gym_open_status: false,
      working_hours_from_time: "09:00",
      working_hours_to_time: "18:00",
      country: "",
      email: "",
      phone: "",
      whatsapp: "",
      facebook_url: "",
      instagram_url: "",
      twitter_url: "",
      linkedin_url: "",
      tiktok_url: "",
      youtube_url: "",
      website_url: "",
    });
  };

  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search locations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-indigo-500 transition"
          />
        </div>
        <GlowButton
          onClick={() => {
            resetForm();
            setEditId(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} /> Add Location
        </GlowButton>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
        </div>
      ) : locations.length > 0 ? (
        <>
          <Table
            headers={["Address", "Status", "Working Hours", "Contact", "Actions"]}
            rows={locations.map((loc) => [
              <span key={`address-${loc.id}`} className="font-bold text-white text-xs block max-w-xs truncate">{loc.address}</span>,
              <span key={`status-${loc.id}`} className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${loc.gym_open_status ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                {loc.gym_open_status ? "Open" : "Closed"}
              </span>,
              <span key={`hours-${loc.id}`} className="text-slate-300 text-xs">{loc.working_hours_from_time} - {loc.working_hours_to_time}</span>,
              <span key={`contact-${loc.id}`} className="text-slate-400 text-xs block">{loc.phone || loc.email || "N/A"}</span>,
              <div key={`actions-${loc.id}`} className="flex gap-3">
                <button
                  className="text-indigo-400 hover:text-indigo-300"
                  onClick={() => {
                    setForm(loc);
                    setEditId(loc.id!);
                    setModalOpen(true);
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="text-red-400 hover:text-red-300"
                  onClick={() => {
                    setDeleteId(loc.id!);
                    setDeleteModalOpen(true);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ])}
          />
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-30">Prev</button>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page {page} of {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-30">Next</button>
            </div>
          )}
        </>
      ) : (
        <EmptyState title="No Locations Found" hint="Add your first location to get started." />
      )}

      {/* Location Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Location" : "Add Location"} footer={<><GlowButton variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</GlowButton><GlowButton onClick={handleSave} disabled={saving}><ButtonLoader label="Submit" loadingLabel="Saving..." loading={saving} /></GlowButton></>}>
        <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Address</label>
            <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Latitude</label>
              <input type="number" className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.latitude} onChange={e => setForm({...form, latitude: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Longitude</label>
              <input type="number" className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.longitude} onChange={e => setForm({...form, longitude: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Radius</label>
              <input type="number" className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.radius} onChange={e => setForm({...form, radius: Number(e.target.value)})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Country</label>
              <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.country} onChange={e => setForm({...form, country: e.target.value})} />
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <input type="checkbox" id="gym_status" className="rounded border-[var(--border-subtle)] bg-transparent text-[var(--accent-orange)]" checked={form.gym_open_status} onChange={e => setForm({...form, gym_open_status: e.target.checked})} />
            <label htmlFor="gym_status" className="text-sm font-bold text-[var(--text-primary)] cursor-pointer">Gym is currently Open</label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Working Hours (From)</label>
              <input type="time" className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.working_hours_from_time} onChange={e => setForm({...form, working_hours_from_time: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Working Hours (To)</label>
              <input type="time" className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.working_hours_to_time} onChange={e => setForm({...form, working_hours_to_time: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email</label>
               <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone</label>
               <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">WhatsApp</label>
               <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Website</label>
               <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Facebook</label>
               <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.facebook_url} onChange={e => setForm({...form, facebook_url: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Instagram</label>
               <input className="w-full rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:border-[var(--accent-orange)] outline-none transition" value={form.instagram_url} onChange={e => setForm({...form, instagram_url: e.target.value})} />
             </div>
          </div>
        </div>
      </Modal>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        description="Are you sure you want to delete this location? This action cannot be undone."
        confirmLabel="Submit"
      />
    </div>
  );
}
