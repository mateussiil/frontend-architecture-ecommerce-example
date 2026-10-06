// As queries pedem só os campos que o domínio usa. O schema da API pode ter muito mais.
const PRODUCT_FIELDS = `
  id
  name
  description
  priceCents
  discountPercent
  stock
  variants
`

export const PRODUCTS_QUERY = `
  query Products {
    products {
      ${PRODUCT_FIELDS}
    }
  }
`

export const PRODUCT_QUERY = `
  query Product($id: ID!) {
    product(id: $id) {
      ${PRODUCT_FIELDS}
    }
  }
`
