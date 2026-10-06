export class InvalidAddressError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'InvalidAddressError'
  }
}

export interface AddressProps {
  street: string
  number: string
  city: string
  zipCode: string
}

export class Address {
  private constructor(private readonly props: AddressProps) {}

  static create(props: AddressProps): Address {
    const trimmed = {
      street: props.street.trim(),
      number: props.number.trim(),
      city: props.city.trim(),
      zipCode: props.zipCode.replace(/\D/g, ''),
    }
    if (!trimmed.street || !trimmed.number || !trimmed.city) {
      throw new InvalidAddressError('Preencha rua, número e cidade.')
    }
    if (trimmed.zipCode.length !== 8) {
      throw new InvalidAddressError('O CEP precisa ter 8 dígitos.')
    }
    return new Address(trimmed)
  }

  toProps(): AddressProps {
    return { ...this.props }
  }
}
