describe('Validation Functions', () => {
  describe('isValidPhone', () => {
    const isValidPhone = (phone: string): boolean => {
      const phoneRegex = /^[\d\+\-\(\)\s]+$/;
      const digitsOnly = phone.replace(/\D/g, '');
      return phoneRegex.test(phone) && digitsOnly.length >= 10;
    };

    it('should accept valid Ukrainian phone numbers', () => {
      expect(isValidPhone('0638352650')).toBe(true);
      expect(isValidPhone('+380638352650')).toBe(true);
      expect(isValidPhone('(063) 835-26-50')).toBe(true);
    });

    it('should reject phone numbers with less than 10 digits', () => {
      expect(isValidPhone('123456789')).toBe(false);
      expect(isValidPhone('+38063')).toBe(false);
    });

    it('should reject phone numbers with invalid characters', () => {
      expect(isValidPhone('abc1234567')).toBe(false);
      expect(isValidPhone('063-835-26-50<script>')).toBe(false);
    });

    it('should accept phone with spaces and dashes', () => {
      expect(isValidPhone('063 835 26 50')).toBe(true);
      expect(isValidPhone('+38 (063) 835-26-50')).toBe(true);
    });
  });

  describe('checkXss', () => {
    const checkXss = (input: string): boolean => {
      const xssPattern = /<script|javascript:|onerror=|onload=|<iframe|<object|<embed|alert\(|confirm\(|prompt\(/i;
      return xssPattern.test(input);
    };

    it('should detect script tags', () => {
      expect(checkXss('<script>alert("xss")</script>')).toBe(true);
      expect(checkXss('Hello<script>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(checkXss('javascript:alert(1)')).toBe(true);
      expect(checkXss('href="javascript:void(0)"')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(checkXss('<img onerror=alert(1)>')).toBe(true);
      expect(checkXss('onload=alert(1)')).toBe(true);
    });

    it('should allow safe text', () => {
      expect(checkXss('Валерий')).toBe(false);
      expect(checkXss('Hello World!')).toBe(false);
      expect(checkXss('Текст сообщения здесь')).toBe(false);
    });

    it('should detect alert/confirm/prompt', () => {
      expect(checkXss('alert("test")')).toBe(true);
      expect(checkXss('confirm("ok?")')).toBe(true);
      expect(checkXss('prompt("enter")')).toBe(true);
    });
  });

  describe('sanitizeHtml', () => {
    const sanitizeHtml = (input: string): string => {
      return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };

    it('should escape HTML tags', () => {
      expect(sanitizeHtml('<script>')).toBe('&lt;script&gt;');
      expect(sanitizeHtml('<b>bold</b>')).toBe('&lt;b&gt;bold&lt;&#x2F;b&gt;');
    });

    it('should escape quotes', () => {
      expect(sanitizeHtml('"test"')).toBe('&quot;test&quot;');
      expect(sanitizeHtml("'test'")).toBe('&#x27;test&#x27;');
    });

    it('should escape ampersands', () => {
      expect(sanitizeHtml('A & B')).toBe('A &amp; B');
    });
  });
});
