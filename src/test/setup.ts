// FE-04: setup dos testes — matchers do jest-dom e limpeza entre testes.
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => cleanup());
