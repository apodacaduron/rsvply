"use client";

import { CheckCircle2, Heart, Loader2, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { useMutation } from '@tanstack/react-query';

export default function RsvpPage() {
    const params = useParams();
  const eventId = params.eventId;

  const [willAttend, setWillAttend] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [guestCount, setGuestCount] = useState<number>();
  const [comments, setComments] = useState('');

  const rsvpMutation = useMutation({
    mutationFn: async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const rsvpData = {
            attending: willAttend === 'yes',
            guest_name: fullName,
            guest_count: willAttend === 'yes' ? (guestCount || 0) : 0,
            guest_message: comments,
            event_id: eventId as string,
        };

        return await supabase.from('rsvp_responses').insert(rsvpData);
    }
  });

  if (rsvpMutation.isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-4 font-inter">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border">
          <CheckCircle2 size={64} className="text-green-500 mx-auto mb-4" />
          {willAttend ? (
            <>
              <h1 className="text-3xl font-bold text-green-700">¡Gracias por tu confirmación!</h1>
              <p className="mt-2 text-lg text-gray-600">
                Tu respuesta ha sido recibida con éxito.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-gray-700">¡Gracias por avisarnos!</h1>
              <p className="mt-2 text-lg text-gray-600">
                Lamentamos que no puedas asistir.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 font-inter">
      <form onSubmit={rsvpMutation.mutate} className="max-w-md w-full space-y-6">

        {/* RSVP Section */}
        <div className="bg-white rounded-xl shadow-lg border p-4">
          <h2 className="text-2xl font-bold mb-4">
            ¡Nos encantaría que nos acompañes! <span className="text-red-500">*</span>
          </h2>
          <div className="flex space-x-4">
            {/* Acepto */}
            <div
              onClick={() => setWillAttend('yes')}
              className={`
                flex-1 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300
                ${willAttend === 'yes' ? 'bg-green-100 text-green-700 shadow-md transform scale-105' : 'bg-gray-50 hover:bg-gray-100'}
              `}
            >
              <Heart
                className={`
                  w-12 h-12 mb-2 transition-all duration-300
                  ${willAttend === 'yes' ? 'text-green-500' : 'text-gray-400'}
                `}
                fill={willAttend === 'yes' ? 'currentColor' : 'none'}
              />
              <span className="text-sm font-medium text-center">
                ¡Sí, con gusto!
              </span>
            </div>
            {/* Declino */}
            <div
              onClick={() => setWillAttend('no')}
              className={`
                flex-1 flex flex-col items-center justify-center p-4 rounded-xl cursor-pointer transition-all duration-300
                ${willAttend === 'no' ? 'bg-red-100 text-red-700 shadow-md transform scale-105' : 'bg-gray-50 hover:bg-gray-100'}
              `}
            >
              <X
                className={`
                  w-12 h-12 mb-2 transition-all duration-300
                  ${willAttend === 'no' ? 'text-red-500' : 'text-gray-400'}
                `}
                fill={willAttend === 'no' ? 'currentColor' : 'none'}
              />
              <span className="text-sm font-medium text-center">
                No puedo asistir
              </span>
            </div>
          </div>
        </div>

        {/* Name Section */}
        <div className="bg-white rounded-xl shadow-lg border p-4">
          <h2 className="text-2xl font-bold mb-4">
            Nombre completo <span className="text-red-500">*</span>
          </h2>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Introduce tu nombre"
            className="w-full"
            disabled={rsvpMutation.isPending}
            required
          />
        </div>

        {/* Conditional rendering for "yes" response */}
        {willAttend === 'yes' && (
          <>
            {/* Guest Section */}
            <div className="bg-white rounded-xl shadow-lg border p-4">
              <h2 className="text-2xl font-bold mb-4">
                ¿Cuántos invitados (incluyéndote a ti) vendrán?
              </h2>
              <Input
                type="number"
                value={guestCount ?? ''}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                min="0"
                className="w-full"
                placeholder="Introduce el número de invitados"
                disabled={rsvpMutation.isPending}
              />
            </div>
            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg border p-4">
              <h2 className="text-2xl font-bold mb-4">
                Déjanos un mensaje
              </h2>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="¡Comparte tus buenos deseos!"
                disabled={rsvpMutation.isPending}
              />
            </div>
          </>
        )}
        
        {/* Conditional rendering for "no" response */}
        {willAttend === 'no' && (
            <div className="bg-white rounded-xl shadow-lg border p-4">
              <h2 className="text-2xl font-bold mb-4">
                Déjanos un mensaje
              </h2>
              <Textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="¡Puedes enviarnos un saludo!"
                disabled={rsvpMutation.isPending}
              />
            </div>
        )}

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full py-6 text-xl"
          disabled={rsvpMutation.isPending || willAttend === null}
        >
          {rsvpMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Enviando...
            </>
          ) : (
            'Enviar'
          )}
        </Button>
      </form>
    </div>
  );
}