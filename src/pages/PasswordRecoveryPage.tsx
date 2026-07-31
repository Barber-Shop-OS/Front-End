import { ArrowLeft, KeyRound } from "lucide-react";

const PasswordRecoveryPage = (): JSX.Element => (
  <div className="flex min-h-screen items-center justify-center bg-[#f7f8fe] px-6">
    <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dce6ff] text-[#0b4bd8]"><KeyRound /></div>
      <div className="text-3xl font-black">Recuperação de Senha</div>
      <p className="mt-3 text-slate-600">Esqueceu sua senha? Digite seu email abaixo e enviaremos um link para redefini-la.</p>
      <div className="mt-8 text-left"><label className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Email registrado</label><input className="mt-2 w-full rounded-xl border border-slate-200 bg-[#eef2ff] px-4 py-4" placeholder="barbeiro@starkblade.com" /></div>
      <button className="mt-8 w-full rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white">Enviar link →</button>
      <button className="mt-6 text-[#0b4bd8] font-semibold"><ArrowLeft className="mr-1 inline h-4 w-4" />Voltar ao login</button>
    </div>
  </div>
);
export default PasswordRecoveryPage;
