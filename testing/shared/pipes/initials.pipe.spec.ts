import { InitialsPipe } from '@shared/pipes/initials.pipe';

describe('InitialsPipe', () => {
  let pipe: InitialsPipe;

  beforeEach(() => {
    pipe = new InitialsPipe();
  });

  it('should return two initials for a full name', () => {
    expect(pipe.transform('María García')).toBe('MG');
  });

  it('should return first two chars for a single word', () => {
    expect(pipe.transform('Ana')).toBe('AN');
  });

  it('should use the first and last word initials for a multi-word name', () => {
    expect(pipe.transform('John Michael Doe')).toBe('JD');
  });

  it('should return ?? for an empty string', () => {
    expect(pipe.transform('')).toBe('??');
  });

  it('should return ?? for a null-like input', () => {
    expect(pipe.transform(null as unknown as string)).toBe('??');
  });

  it('should return uppercase initials', () => {
    expect(pipe.transform('alice bob')).toBe('AB');
  });

  it('should handle names with extra whitespace', () => {
    expect(pipe.transform('  Carlo  Rossi  ')).toBe('CR');
  });
});
