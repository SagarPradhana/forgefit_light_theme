import { useState, useEffect } from "react";
import { GlowButton, Modal, ButtonLoader } from "../../ui/primitives";
import { Search, Edit2, Trash2, Plus, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { adminLocationService, type LocationData } from "../../../services/adminLocationService";
import { toast } from "../../../store/toastStore";
import { DeleteConfirmationModal } from "../../common/DeleteConfirmationModal";

const inp = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all";
const lbl = "text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 block";

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
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<LocationData>({
    latitude: 0, longitude: 0, radius: 0, address: "", gym_open_status: false,
    working_hours_from_time: "09:00", working_hours_to_time: "18:00", country: "",
    email: "", phone: "", whatsapp: "", facebook_url: "", instagram_url: "",
    twitter_url: "", linkedin_url: "", tiktok_url: "", youtube_url: "", website_url: "",
  });

  useEffect(() => { fetchLocations(page); }, [page, search]);

  const fetchLocations = async (p: number) => {
    setLoading(true);
    try {
      const res = await adminLocationService.getLocations({ offset: (p - 1) * 10, count: 10, search });
      setLocations(res.data || []);
      setTotalCount(res.totalcount || 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editId) { await adminLocationService.updateLocation(editId, form); toast.success("Location updated successfully!"); }
      else { await adminLocationService.createLocation(form); toast.success("Location created successfully!"); }
      setModalOpen(false); fetchLocations(page);
    } catch (err) { console.error(err); toast.error("Operation failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminLocationService.deleteLocation(deleteId);
      toast.success("Location deleted successfully!");
      setDeleteModalOpen(false); fetchLocations(page);
    } catch (err) { console.error(err); toast.error("Failed to delete location."); }
  };

  const resetForm = () => setForm({
    latitude: 0, longitude: 0, radius: 0, address: "", gym_open_status: false,
    working_hours_from_time: "09:00", working_hours_to_time: "18:00", country: "",
    email: "", phone: "", whatsapp: "", facebook_url: "", instagram_url: "",
    twitter_url: "", linkedin_url: "", tiktok_url: "", youtube_url: "", website_url: "",
  });

  const totalPages = Math.ceil(totalCount / 10) || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all" />
        </div>
        <GlowButton onClick={() => { resetForm(); setEditId(null); setModalOpen(true); }} className="flex items-center gap-2">
          <Plus size={16} /> Add Location
        </GlowButton>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />)}
          </div>
        ) : locations.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Address</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hours</th>
                    <th className="text-left px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Contact</th>
                    <th className="text-right px-5 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {locations.map((loc) => (
                    <tr key={loc.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <MapPin size={14} className="text-gray-300 shrink-0" />
                          <span className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{loc.address}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${loc.gym_open_status ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {loc.gym_open_status ? "Open" : "Closed"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">{loc.working_hours_from_time} - {loc.working_hours_to_time}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-500">{loc.phone || loc.email || "N/A"}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setForm(loc); setEditId(loc.id!); setModalOpen(true); }}
                            className="p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-all">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => { setDeleteId(loc.id!); setDeleteModalOpen(true); }}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/30">
                <span className="text-xs text-gray-500 font-medium">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <MapPin size={24} className="text-gray-400" />
            </div>
            <p className="text-base font-semibold text-gray-700">No Locations Found</p>
            <p className="text-sm text-gray-400 mt-1">Add your first location to get started.</p>
          </div>
        )}
      </div>

      {/* Location Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editId ? "Edit Location" : "Add Location"}
        footer={<><GlowButton variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</GlowButton><GlowButton onClick={handleSave} disabled={saving}><ButtonLoader label="Submit" loadingLabel="Saving..." loading={saving} /></GlowButton></>}>
        <div className="space-y-4 pt-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <div><label className={lbl}>Address</label><input className={inp} value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Latitude</label><input type="number" className={inp} value={form.latitude} onChange={e => setForm({...form, latitude: Number(e.target.value)})} /></div>
            <div><label className={lbl}>Longitude</label><input type="number" className={inp} value={form.longitude} onChange={e => setForm({...form, longitude: Number(e.target.value)})} /></div>
            <div><label className={lbl}>Radius</label><input type="number" className={inp} value={form.radius} onChange={e => setForm({...form, radius: Number(e.target.value)})} /></div>
            <div><label className={lbl}>Country</label><input className={inp} value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-orange-50/50 border border-orange-100">
            <input type="checkbox" id="gym_status" className="rounded border-orange-200 text-orange-500 focus:ring-orange-500/30" checked={form.gym_open_status} onChange={e => setForm({...form, gym_open_status: e.target.checked})} />
            <label htmlFor="gym_status" className="text-sm font-semibold text-gray-800 cursor-pointer">Gym is currently Open</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Working Hours (From)</label><input type="time" className={inp} value={form.working_hours_from_time} onChange={e => setForm({...form, working_hours_from_time: e.target.value})} /></div>
            <div><label className={lbl}>Working Hours (To)</label><input type="time" className={inp} value={form.working_hours_to_time} onChange={e => setForm({...form, working_hours_to_time: e.target.value})} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Email</label><input className={inp} value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
            <div><label className={lbl}>Phone</label><input className={inp} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
            <div><label className={lbl}>WhatsApp</label><input className={inp} value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} /></div>
            <div><label className={lbl}>Website</label><input className={inp} value={form.website_url} onChange={e => setForm({...form, website_url: e.target.value})} /></div>
            <div><label className={lbl}>Facebook</label><input className={inp} value={form.facebook_url} onChange={e => setForm({...form, facebook_url: e.target.value})} /></div>
            <div><label className={lbl}>Instagram</label><input className={inp} value={form.instagram_url} onChange={e => setForm({...form, instagram_url: e.target.value})} /></div>
          </div>
        </div>
      </Modal>

      <DeleteConfirmationModal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} onConfirm={handleDelete}
        title="Delete Location" description="Are you sure you want to delete this location? This action cannot be undone." confirmLabel="Submit" />
    </div>
  );
}
