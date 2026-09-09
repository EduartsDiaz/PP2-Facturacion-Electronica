import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit2, Key } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import userService from '../../services/users/userService';
import type { User } from '../../types';

const ROLE_LABELS: Record<string, string> = { admin: 'Administrador', cajero: 'Cajero', supervisor: 'Supervisor', contador: 'Contador' };

const createSchema = z.object({
  username: z.string().min(4, 'Mínimo 4 caracteres'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  name: z.string().min(3, 'Nombre requerido'),
  email: z.string().email('Correo inválido'),
  role: z.enum(['admin','cajero','supervisor','contador']),
});

const editSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  role: z.enum(['admin','cajero','supervisor','contador']),
  active: z.boolean(),
});

const pwdSchema = z.object({ password: z.string().min(8, 'Mínimo 8 caracteres') });

type CreateForm = z.infer<typeof createSchema>;
type EditForm = z.infer<typeof editSchema>;

function CreateModal({ onClose, onSave }: { onClose: () => void; onSave: (d: CreateForm) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateForm>({ resolver: zodResolver(createSchema) });
  return (
    <div className="modal d-block" style={{ background:'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Nuevo usuario</h5><button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" /></div>
          <form onSubmit={handleSubmit(onSave)}>
            <div className="modal-body row g-3">
              <div className="col-6"><label className="form-label fw-semibold">Usuario *</label><input className={`form-control ${errors.username?'is-invalid':''}`} {...register('username')} />{errors.username&&<div className="invalid-feedback">{errors.username.message}</div>}</div>
              <div className="col-6"><label className="form-label fw-semibold">Contraseña *</label><input type="password" className={`form-control ${errors.password?'is-invalid':''}`} {...register('password')} />{errors.password&&<div className="invalid-feedback">{errors.password.message}</div>}</div>
              <div className="col-12"><label className="form-label fw-semibold">Nombre completo *</label><input className={`form-control ${errors.name?'is-invalid':''}`} {...register('name')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Correo *</label><input type="email" className={`form-control ${errors.email?'is-invalid':''}`} {...register('email')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Rol *</label><select className="form-select" {...register('role')}><option value="cajero">Cajero</option><option value="supervisor">Supervisor</option><option value="contador">Contador</option><option value="admin">Administrador</option></select></div>
              <div className="col-12"><div className="alert alert-warning py-2 small">TODO: BACKEND — en producción la contraseña debe hashearse con bcrypt en el servidor. Nunca almacenar en texto plano.</div></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary">Crear usuario</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

function EditModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (d: EditForm) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<EditForm>({ resolver: zodResolver(editSchema), defaultValues: { name: user.name, email: user.email, role: user.role, active: user.active } });
  return (
    <div className="modal d-block" style={{ background:'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Editar usuario: {user.username}</h5><button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" /></div>
          <form onSubmit={handleSubmit(onSave)}>
            <div className="modal-body row g-3">
              <div className="col-12"><label className="form-label fw-semibold">Nombre completo</label><input className={`form-control ${errors.name?'is-invalid':''}`} {...register('name')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Correo</label><input type="email" className="form-control" {...register('email')} /></div>
              <div className="col-md-6"><label className="form-label fw-semibold">Rol</label><select className="form-select" {...register('role')}><option value="cajero">Cajero</option><option value="supervisor">Supervisor</option><option value="contador">Contador</option><option value="admin">Administrador</option></select></div>
              <div className="col-12 d-flex"><div className="form-check"><input type="checkbox" className="form-check-input" id="uActive" {...register('active')} /><label htmlFor="uActive" className="form-check-label">Activo</label></div></div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-primary">Guardar</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ user, onClose, onSave }: { user: User; onClose: () => void; onSave: (pwd: string) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm<{ password: string }>({ resolver: zodResolver(pwdSchema) });
  return (
    <div className="modal d-block" style={{ background:'rgba(0,0,0,.5)' }} role="dialog">
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header"><h5 className="modal-title">Cambiar contraseña: {user.username}</h5><button type="button" className="btn-close" onClick={onClose} aria-label="Cerrar" /></div>
          <form onSubmit={handleSubmit(d => onSave(d.password))}>
            <div className="modal-body">
              <label className="form-label fw-semibold">Nueva contraseña *</label>
              <input type="password" className={`form-control ${errors.password?'is-invalid':''}`} {...register('password')} />
              {errors.password&&<div className="invalid-feedback">{errors.password.message}</div>}
              <div className="alert alert-warning mt-3 py-2 small">TODO: BACKEND — en producción usar bcrypt + transmisión segura</div>
            </div>
            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button><button type="submit" className="btn btn-warning">Cambiar contraseña</button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const { session } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState(() => userService.getAll());
  const [modal, setModal] = useState<'create' | 'edit' | 'password' | null>(null);
  const [selected, setSelected] = useState<User | null>(null);

  const refresh = () => setUsers(userService.getAll());

  const handleCreate = (d: CreateForm) => {
    if (!session) return;
    userService.create(d, session);
    toast('Usuario creado correctamente', 'success');
    refresh(); setModal(null);
  };

  const handleEdit = (d: EditForm) => {
    if (!session || !selected) return;
    userService.update(selected.id, d, session);
    toast('Usuario actualizado', 'success');
    refresh(); setModal(null);
  };

  const handlePwd = (pwd: string) => {
    if (!session || !selected) return;
    userService.changePassword(selected.id, pwd, session);
    toast('Contraseña actualizada', 'success');
    setModal(null);
  };

  return (
    <div className="p-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div><h2 className="h4 fw-bold mb-0">Usuarios</h2><p className="text-muted small mb-0">Gestión de accesos y roles (RBAC)</p></div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setModal('create')}><Plus size={16}/> Nuevo usuario</button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light"><tr><th>Usuario</th><th>Nombre</th><th>Correo</th><th className="text-center">Rol</th><th className="text-center">Estado</th><th className="text-center">Acciones</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="font-monospace fw-semibold">{u.username}</td>
                  <td>{u.name}</td>
                  <td className="small text-muted">{u.email}</td>
                  <td className="text-center"><span className="badge bg-primary">{ROLE_LABELS[u.role] ?? u.role}</span></td>
                  <td className="text-center">{u.active ? <span className="badge bg-success">Activo</span> : <span className="badge bg-secondary">Inactivo</span>}</td>
                  <td className="text-center">
                    <div className="d-flex gap-1 justify-content-center">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => { setSelected(u); setModal('edit'); }} aria-label={`Editar ${u.username}`}><Edit2 size={13}/></button>
                      <button className="btn btn-sm btn-outline-warning" onClick={() => { setSelected(u); setModal('password'); }} aria-label={`Cambiar contraseña de ${u.username}`}><Key size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal === 'create' && <CreateModal onClose={() => setModal(null)} onSave={handleCreate} />}
      {modal === 'edit' && selected && <EditModal user={selected} onClose={() => setModal(null)} onSave={handleEdit} />}
      {modal === 'password' && selected && <PasswordModal user={selected} onClose={() => setModal(null)} onSave={handlePwd} />}
    </div>
  );
}
