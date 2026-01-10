import { useState } from 'react';
import type { Project } from '@pague-dev/sdk-node';
import type { SelectorColor } from '../ui/types';
import { radioColors, selectorDefaults } from '../ui/theme';
import { Spinner } from '../ui/Spinner';

interface ProjectSelectorProps {
  projects: Project[];
  loading: boolean;
  name: string;
  color: SelectorColor;
  onCreateProject: (formData: FormData) => void;
  createLoading?: boolean;
  apiKey: string;
  selectedId?: string | null;
  onSelect?: (projectId: string) => void;
}

const buttonColors = {
  emerald: 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-700',
  blue: 'bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700',
  purple: 'bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-700',
};

const outlineButtonColors = {
  emerald: 'border-emerald-600 text-emerald-400 hover:bg-emerald-600/10',
  blue: 'border-blue-600 text-blue-400 hover:bg-blue-600/10',
  purple: 'border-purple-600 text-purple-400 hover:bg-purple-600/10',
};

export function ProjectSelector({
  projects,
  loading,
  name,
  color,
  onCreateProject,
  createLoading,
  apiKey,
  selectedId,
  onSelect,
}: ProjectSelectorProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-500">
        <Spinner />
        Carregando projetos...
      </div>
    );
  }

  if (projects.length > 0 && !showCreateForm) {
    return (
      <div className="space-y-3">
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {projects.map((project) => (
            <label
              key={project.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedId === project.id
                  ? 'bg-zinc-700 ring-1 ring-zinc-600'
                  : 'bg-zinc-800/50 hover:bg-zinc-800'
              }`}
            >
              <input
                type="radio"
                name={name}
                value={project.id}
                checked={selectedId === project.id}
                onChange={() => onSelect?.(project.id)}
                className={`w-4 h-4 ${radioColors[color]}`}
              />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: project.color }} />
              <span className="font-medium">{project.name}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowCreateForm(true)}
          className={`w-full border ${outlineButtonColors[color]} px-3 py-2 rounded-lg text-sm font-medium transition-colors`}
        >
          + Novo projeto
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onCreateProject(new FormData(e.currentTarget));
    setShowCreateForm(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {projects.length === 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-900/20 border border-amber-700/50 rounded-lg">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="text-amber-300 font-medium text-sm">Projeto necessário</p>
            <p className="text-amber-400/70 text-xs mt-0.5">Você precisa criar um projeto antes de gerar cobranças</p>
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <input
          name="name"
          type="text"
          required
          placeholder="Nome do projeto"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white text-sm focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all"
        />
        <input name="color" type="color" defaultValue={selectorDefaults[color]} className="w-10 h-10 rounded-lg cursor-pointer" />
        <input name="description" type="hidden" value="" />
        <button
          type="submit"
          disabled={createLoading || !apiKey}
          className={`${buttonColors[color]} px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:cursor-not-allowed`}
        >
          {createLoading ? 'Criando...' : 'Criar'}
        </button>
        {projects.length > 0 && (
          <button
            type="button"
            onClick={() => setShowCreateForm(false)}
            className="px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
          >
            Cancelar
          </button>
        )}
      </div>
      {!apiKey && (
        <p className="text-red-400 text-xs">Informe sua API Key primeiro para criar um projeto</p>
      )}
    </form>
  );
}
