export class InvalidMoneyError extends Error {
  constructor(cents: number) {
    super(`Valor monetário inválido: ${cents}.`)
    this.name = 'InvalidMoneyError'
  }
}

// Value object: dinheiro sempre em centavos inteiros, nunca em ponto flutuante.
// Ele sabe somar e calcular porcentagens. Como o valor aparece na tela é problema da UI.
export class Money {
  private constructor(private readonly value: number) {}

  static cents(cents: number): Money {
    if (!Number.isInteger(cents) || cents < 0) {
      throw new InvalidMoneyError(cents)
    }
    return new Money(cents)
  }

  static zero(): Money {
    return new Money(0)
  }

  inCents(): number {
    return this.value
  }

  add(other: Money): Money {
    return new Money(this.value + other.value)
  }

  subtract(other: Money): Money {
    return new Money(Math.max(0, this.value - other.value))
  }

  times(quantity: number): Money {
    return Money.cents(this.value * quantity)
  }

  percentage(percent: number): Money {
    return new Money(Math.round((this.value * percent) / 100))
  }

  min(other: Money): Money {
    return this.value <= other.value ? this : other
  }

  isZero(): boolean {
    return this.value === 0
  }

  isLessThan(other: Money): boolean {
    return this.value < other.value
  }

  equals(other: Money): boolean {
    return this.value === other.value
  }
}
