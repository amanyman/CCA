import { useState } from 'react';
import { Loader2, MessageSquarePlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ReferralNote } from '../../types/referral';

interface NoteFormProps {
  referralId: string;
  onNoteAdded: (note: ReferralNote) => void;
}

export function NoteForm({ referralId, onNoteAdded }: NoteFormProps) {
  const { user } = useAuth();
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!note.trim() || !user) return;

    setIsSubmitting(true);
    setError('');

    try {
      // Get admin ID
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('id, name')
        .eq('user_id', user.id)
        .single();

      if (adminError || !adminData) {
        throw new Error('Admin not found');
      }

      const { data: noteData, error: insertError } = await supabase
        .from('referral_notes')
        .insert({
          referral_id: referralId,
          admin_id: adminData.id,
          author_type: 'admin',
          note: note.trim(),
          is_visible_to_provider: false,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onNoteAdded({
        ...noteData,
        admin: { name: adminData.name },
      });

      setNote('');
    } catch (err) {
      console.error('Error adding note:', err);
      setError('Failed to add note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Add Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 5000))}
          rows={3}
          maxLength={5000}
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
          placeholder="Enter your note here..."
        />
        <div className="text-xs text-slate-400 text-right mt-1">{note.length}/5000</div>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !note.trim()}
        className="inline-flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <MessageSquarePlus className="w-4 h-4" />
            Add Note
          </>
        )}
      </button>
    </form>
  );
}
