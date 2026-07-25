import {
  useRef,
  useState,
  type ChangeEvent,
  type ClipboardEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { MdMarkEmailRead } from "react-icons/md";

const CODE_LENGTH = 6;

function VerifyEmailPage(): JSX.Element {
  const navigate = useNavigate();
  const email = "user@example.com";
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete = code.every((digit) => digit !== "");

  const handleChange = (
    event: ChangeEvent<HTMLInputElement>,
    index: number,
  ): void => {
    const nextValue = event.target.value.replace(/\D/g, "").slice(0, 1);
    const nextCode = [...code];
    nextCode[index] = nextValue;

    setCode(nextCode);
    setError("");
    setSuccessMessage("");

    if (nextValue && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    index: number,
  ): void => {
    if (event.key === "Backspace" && !code[index] && index > 0) {
      const previousCode = [...code];
      previousCode[index - 1] = "";
      setCode(previousCode);
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault();
    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    if (!pastedValue) {
      return;
    }

    const nextCode = Array(CODE_LENGTH).fill("");
    pastedValue.split("").forEach((digit, index) => {
      nextCode[index] = digit;
    });

    setCode(nextCode);
    setError("");
    setSuccessMessage("");

    const nextIndex = Math.min(pastedValue.length, CODE_LENGTH - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (!isComplete) {
      setError("Informe os 6 dígitos do código para continuar.");
      return;
    }

    const normalizedCode = code.join("");

    if (normalizedCode.length !== CODE_LENGTH || /\D/.test(normalizedCode)) {
      setError("O código deve conter apenas números.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("Código verificado com sucesso!");

    window.setTimeout(() => {
      navigate("/login");
    }, 900);
  };

  const handleResend = (): void => {
    setCode(Array(CODE_LENGTH).fill(""));
    setError("");
    setSuccessMessage("Um novo código foi enviado para o seu e-mail.");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center gap-10 bg-[#F1F3FF] px-4">
      <h1 className="text-center text-2xl font-semibold text-[#004AC6]">
        BarberOS
      </h1>

      <section className="flex w-full max-w-[400px] flex-col items-center gap-5 rounded-[12px] bg-[#FFFFFF] p-5 shadow-sm">
        <div className="flex h-[80px] w-[80px] items-center justify-center rounded-[12px] bg-[#E1E8FD]">
          <MdMarkEmailRead className="text-4xl text-[#004AC6]" />
        </div>

        <h2 className="text-center text-xl font-bold text-[#434655]">
          Verifique seu Email
        </h2>

        <p className="w-[80%] text-center text-sm text-[#434655]">
          Enviamos um código de 6 dígitos para{" "}
          <span className="font-bold">{email}</span>. Insira-o abaixo.
        </p>

        <form
          className="flex w-full flex-col items-center gap-4"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="flex flex-row items-center justify-center gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(event, index)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                onPaste={handlePaste}
                aria-label={`Dígito ${index + 1} do código`}
                className="h-[52px] w-[52px] rounded-[6px] border-none bg-[#F1F3FF] text-center text-lg font-semibold text-[#434655] outline-none focus:ring-2 focus:ring-[#004AC6]"
              />
            ))}
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </p>
          ) : null}

          {successMessage ? (
            <p
              className="text-sm text-green-600"
              role="status"
              aria-live="polite"
            >
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!isComplete || isSubmitting}
            className="mt-3 h-[52px] w-[60%] rounded-[6px] bg-[#004AC6] text-center text-md font-semibold text-[#FFFFFF] transition-colors hover:bg-[#003399] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Verificando..." : "Verificar Código"}
          </button>
        </form>

        <p className="text-center text-sm text-[#434655]">
          Não recebeu o código? <br />
          <button
            type="button"
            onClick={handleResend}
            className="font-bold text-[#004AC6] underline underline-offset-2"
          >
            Reenviar Código
          </button>
        </p>
      </section>
    </div>
  );
}

export default VerifyEmailPage;
