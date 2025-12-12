import { useState, useEffect } from "react";
import { storage } from "../services/storage";
import type { Gym } from "../types";
import Modal from "../components/Modal";
import { Plus, Edit, Trash, Dumbbell } from "lucide-react";
import "./GroupsPage.css"; // Reusing styles

export default function GymsPage() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGym, setEditingGym] = useState<Gym | null>(null);
  const [name, setName] = useState("");

  const loadData = async () => {
    const data = await storage.getGyms();
    setGyms(data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (gym?: Gym) => {
    if (gym) {
      setEditingGym(gym);
      setName(gym.name);
    } else {
      setEditingGym(null);
      setName("");
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) return;

    if (editingGym) {
      await storage.updateGym({ ...editingGym, name });
    } else {
      await storage.addGym({ name, address: "" });
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questa palestra?")) {
      await storage.deleteGym(id);
      loadData();
    }
  };

  return (
    <div className="page">
      <header className="page-header flex-between">
        <h1>Palestre</h1>
        <button className="btn" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nuova Palestra
        </button>
      </header>

      <div className="groups-list">
        {gyms.map((gym) => (
          <div key={gym.id} className="group-card glass-panel">
            <div className="group-info">
              <Dumbbell className="text-primary" />
              <h3>{gym.name}</h3>
            </div>
            <div className="group-actions">
              <button className="btn-icon" onClick={() => handleOpenModal(gym)}>
                <Edit size={18} />
              </button>
              <button
                className="btn-icon text-danger"
                onClick={() => handleDelete(gym.id)}
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGym ? "Modifica Palestra" : "Nuova Palestra"}
      >
        <div className="form-group">
          <label>Nome Palestra</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Palestra Marconi"
          />
        </div>
        <div className="form-actions">
          <button className="btn" onClick={handleSave}>
            Salva
          </button>
        </div>
      </Modal>
    </div>
  );
}
