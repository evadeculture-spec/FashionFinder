import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/state/AppState';
import { useToast } from '@/state/Toast';
import { img } from '@/data/images';
import { Page, PageHeader } from '@/components/layout/PageHeader';
import { Logo } from '@/components/layout/Logo';
import { Button } from '@/components/ui/Button';
import { Field, SimulatedNote } from '@/components/ui/misc';
import { SmartImage } from '@/components/ui/SmartImage';

/* Simulated authentication: no credentials are sent or stored. */
export default function Auth() {
  const [params, setParams] = useSearchParams();
  const register = params.has('registo');
  const { dispatch, state } = useApp();
  const toast = useToast();
  const nav = useNavigate();
  const [name, setName] = useState(register ? '' : state.profile.name);
  const [email, setEmail] = useState(register ? '' : state.profile.email);
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (register && !name.trim()) err.name = 'Indica o teu nome.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) err.email = 'Indica um email válido.';
    if (password.length < 8) err.password = 'Mínimo de 8 caracteres.';
    if (register && !consent) err.consent = 'É necessário aceitar os termos.';
    setErrors(err);
    if (Object.keys(err).length) return;
    dispatch({ type: 'signIn', name: register ? name.trim() : state.profile.name, email: email.trim() });
    toast({ message: register ? 'Conta criada (simulação)' : 'Sessão iniciada (simulação)', tone: 'success' });
    nav('/perfil');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader />
      <Page className="grid min-h-[80dvh] items-center gap-10 py-8 lg:grid-cols-2">
        <SmartImage src={img.streetB} alt="" label="VESTA" className="hidden aspect-[4/5] rounded-card lg:block" />
        <div className="mx-auto w-full max-w-sm">
          <Logo />
          <h1 className="mt-6 font-display text-3xl">{register ? 'Cria a tua conta' : 'Olá de novo'}</h1>
          <p className="mt-1 text-sm text-muted">{register ? 'Só precisamos de nome e email.' : 'Entra para ver os teus guardados.'}</p>
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {register && (
              <Field label="Nome" htmlFor="au-name">
                <input id="au-name" className="field" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} />
                {errors.name && <p role="alert" className="mt-1 text-xs text-danger">{errors.name}</p>}
              </Field>
            )}
            <Field label="Email" htmlFor="au-email">
              <input id="au-email" type="email" className="field" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              {errors.email && <p role="alert" className="mt-1 text-xs text-danger">{errors.email}</p>}
            </Field>
            <Field label="Palavra-passe" htmlFor="au-pw">
              <input id="au-pw" type="password" className="field" autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
              {errors.password && <p role="alert" className="mt-1 text-xs text-danger">{errors.password}</p>}
            </Field>
            {register && (
              <label className="flex items-start gap-2 text-[13px] text-ink-soft">
                <input type="checkbox" className="mt-0.5 size-4 accent-ink" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                Aceito os termos de utilização e a política de privacidade.
              </label>
            )}
            {errors.consent && <p role="alert" className="text-xs text-danger">{errors.consent}</p>}
            <Button type="submit" block size="lg">
              {register ? 'Criar conta' : 'Entrar'}
            </Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted">
            {register ? 'Já tens conta?' : 'Ainda não tens conta?'}{' '}
            <button className="font-semibold text-ink underline underline-offset-4" onClick={() => setParams(register ? {} : { registo: '1' })}>
              {register ? 'Entrar' : 'Criar conta'}
            </button>
          </p>
          <SimulatedNote className="mt-6">Autenticação simulada. Nenhuma palavra-passe é enviada ou guardada.</SimulatedNote>
        </div>
      </Page>
    </div>
  );
}
