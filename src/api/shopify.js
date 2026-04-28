const SHOPIFY_DOMAIN = "4auutp-cr.myshopify.com";
const STOREFRONT_TOKEN = "629c3006f846b5bae85befe812aa3dca";

const endpoint = `https://${SHOPIFY_DOMAIN}/api/2024-01/graphql.json`;

export const getAllCollections = async () => {
  const query = `
  {
    collections(first: 50) {
      edges {
        node {
          id
          title
          handle
          image {
            url
          }
          products(first: 1) {
            edges {
              node {
                featuredImage {
                  url
                }
              }
            }
          }
          productsCount {
            count
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    const edges = json?.data?.collections?.edges || [];
    return edges.map((e) => {
      const node = e.node;
      const firstProductImage = node.products?.edges?.[0]?.node?.featuredImage?.url;
      const imageUrl = node.image?.url || firstProductImage || null;
      return { ...e, node: { ...node, imageUrl } };
    });
  } catch (error) {
    console.log("Shopify collections error:", error);
    return [];
  }
};

export const getProductsByCollection = async (handle) => {
  const query = `
  {
    collectionByHandle(handle: "${handle}") {
      title
      products(first: 20) {
        edges {
          node {
            id
            title
            description
            featuredImage {
              url
            }
            images(first:1) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first:1) {
              edges {
                node {
                  id
                  price {
                    amount
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.collectionByHandle?.products?.edges || [];

  } catch (error) {
    console.log("Shopify error:", error);
    return [];
  }
};

export const searchProducts = async (searchQuery) => {
  const query = `
  {
    products(first: 20, query: "${searchQuery}") {
      edges {
        node {
          id
          title
          description
          images(first: 1) {
            edges {
              node {
                url
              }
            }
          }
          variants(first: 1) {
            edges {
              node {
                id
                price {
                  amount
                }
              }
            }
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.products?.edges || [];

  } catch (error) {
    console.log("Shopify search error:", error);
    return [];
  }
};

const formatPhoneE164 = (value) => {
  const trimmed = (value || '').trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 10) return null;
  if (digits.length === 10 && ['6','7','8','9'].includes(digits[0])) {
    return `+91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (trimmed.startsWith('+') && digits.length >= 10) return trimmed;
  return null;
};

export const registerCustomer = async (email, password, name, phone = null) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Customer';
  const lastName = parts.slice(1).join(' ') || null;
  const phoneFormatted = phone ? formatPhoneE164(phone) : null;

  const input = {
    email: (email || '').trim(),
    password: password || '',
    firstName
  };
  if (lastName) input.lastName = lastName;
  if (phoneFormatted) input.phone = phoneFormatted;

  const query = `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables: { input } })
    });

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {
      const msg = json.errors[0].message || "GraphQL error";
      console.log("Shopify register GraphQL errors:", json.errors);
      return { customerUserErrors: [{ message: msg }] };
    }

    const result = json?.data?.customerCreate;
    if (!result) {
      return { customerUserErrors: [{ message: "No response from server" }] };
    }

    return result;

  } catch (error) {
    console.log("Shopify register error:", error);
    return { customerUserErrors: [{ message: error.message || "Network error" }] };
  }
};

export const loginCustomer = async (email, password) => {
  const query = `
  mutation {
    customerAccessTokenCreate(input: {
      email: "${email}",
      password: "${password}"
    }) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.customerAccessTokenCreate || { customerUserErrors: [{ message: "Unknown error" }] };

  } catch (error) {
    console.log("Shopify login error:", error);
    return { customerUserErrors: [{ message: error.message }] };
  }
};

export const getCustomer = async (accessToken) => {
  const query = `
  query {
    customer(customerAccessToken: "${accessToken}") {
      id
      email
      firstName
      lastName
      phone
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.customer || null;

  } catch (error) {
    console.log("Shopify get customer error:", error);
    return null;
  }
};

export const updateCustomer = async (accessToken, customerData) => {
  const query = `
  mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
    customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;

  const variables = {
    customerAccessToken: accessToken,
    customer: customerData
  };

  const fetchWithTimeout = async (timeoutMs = 15000) => {
    const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query, variables }),
        signal: controller?.signal
      });
      if (timeoutId) clearTimeout(timeoutId);
      return response;
    } catch (e) {
      if (timeoutId) clearTimeout(timeoutId);
      throw e;
    }
  };

  try {
    const response = await fetchWithTimeout();
    const json = await response.json();
    return json?.data?.customerUpdate || { customerUserErrors: [{ message: "Update failed" }] };
  } catch (error) {
    console.log("Shopify update customer error:", error);
    const isNetwork = error.message?.includes("Network") || error.name === "AbortError";
    const msg = isNetwork
      ? "Network error. Check your internet connection and try again."
      : error.message || "Update failed";
    throw new Error(msg);
  }
};

export const createCheckout = async (cartItems, customerEmail) => {
  const validItems = cartItems.filter(item => {
    const variantId = item.node?.variants?.edges?.[0]?.node?.id;
    return variantId && item.quantity > 0;
  });

  if (validItems.length === 0) {
    return { checkoutUserErrors: [{ message: "No valid items in cart" }] };
  }

  const lines = validItems.map(item => {
    const variantId = item.node.variants.edges[0].node.id;
    return {
      merchandiseId: variantId,
      quantity: item.quantity
    };
  });

  const query = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart {
        id
        checkoutUrl
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 10) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  title
                }
              }
            }
          }
        }
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  `;

  const variables = {
    input: {
      lines: lines,
      ...(customerEmail && { buyerIdentity: { email: customerEmail } })
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables })
    });

    const json = await response.json();
    
    if (json.errors) {
      console.log("GraphQL errors:", json.errors);
      return { checkoutUserErrors: [{ message: json.errors[0]?.message || "GraphQL error" }] };
    }

    const cartData = json?.data?.cartCreate;
    
    if (cartData?.userErrors?.length > 0) {
      return { checkoutUserErrors: cartData.userErrors };
    }

    if (cartData?.cart) {
      return {
        checkout: {
          id: cartData.cart.id,
          webUrl: cartData.cart.checkoutUrl
        },
        checkoutUserErrors: []
      };
    }

    return { checkoutUserErrors: [{ message: "Could not create cart" }] };

  } catch (error) {
    console.log("Shopify cart error:", error);
    return { checkoutUserErrors: [{ message: error.message }] };
  }
};

export const associateCustomerWithCheckout = async (cartId, customerAccessToken) => {
  const query = `
  mutation cartBuyerIdentityUpdate($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
      }
      userErrors {
        code
        field
        message
      }
    }
  }
  `;

  const variables = {
    cartId: cartId,
    buyerIdentity: {
      customerAccessToken: customerAccessToken
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables })
    });

    const json = await response.json();
    return json?.data?.cartBuyerIdentityUpdate || null;

  } catch (error) {
    console.log("Shopify associate customer error:", error);
    return null;
  }
};

export const getCustomerOrders = async (customerAccessToken) => {
  const query = `
  query {
    customer(customerAccessToken: "${customerAccessToken}") {
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            orderNumber
            processedAt
            financialStatus
            fulfillmentStatus
            totalPrice {
              amount
              currencyCode
            }
            lineItems(first: 10) {
              edges {
                node {
                  title
                  quantity
                  variant {
                    price {
                      amount
                    }
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.customer?.orders?.edges || [];

  } catch (error) {
    console.log("Shopify get orders error:", error);
    return [];
  }
};

export const getCustomerAddresses = async (customerAccessToken) => {
  const query = `
  query {
    customer(customerAccessToken: "${customerAccessToken}") {
      defaultAddress {
        id
      }
      addresses(first: 10) {
        edges {
          node {
            id
            firstName
            lastName
            address1
            address2
            city
            province
            country
            zip
            phone
          }
        }
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    const customer = json?.data?.customer;
    return {
      addresses: customer?.addresses?.edges || [],
      defaultAddressId: customer?.defaultAddress?.id || null
    };

  } catch (error) {
    console.log("Shopify get addresses error:", error);
    return { addresses: [], defaultAddressId: null };
  }
};

export const createCustomerAddress = async (customerAccessToken, address) => {
  const query = `
  mutation {
    customerAddressCreate(
      customerAccessToken: "${customerAccessToken}",
      address: {
        firstName: "${address.firstName || ''}",
        lastName: "${address.lastName || ''}",
        address1: "${address.address1 || ''}",
        address2: "${address.address2 || ''}",
        city: "${address.city || ''}",
        province: "${address.province || ''}",
        country: "${address.country || 'India'}",
        zip: "${address.zip || ''}",
        phone: "${address.phone || ''}"
      }
    ) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.customerAddressCreate || { customerUserErrors: [{ message: "Unknown error" }] };

  } catch (error) {
    console.log("Shopify create address error:", error);
    return { customerUserErrors: [{ message: error.message }] };
  }
};

export const updateCustomerAddress = async (customerAccessToken, addressId, address) => {
  const query = `
  mutation {
    customerAddressUpdate(
      customerAccessToken: "${customerAccessToken}",
      id: "${addressId}",
      address: {
        firstName: "${address.firstName || ''}",
        lastName: "${address.lastName || ''}",
        address1: "${address.address1 || ''}",
        address2: "${address.address2 || ''}",
        city: "${address.city || ''}",
        province: "${address.province || ''}",
        country: "${address.country || 'India'}",
        zip: "${address.zip || ''}",
        phone: "${address.phone || ''}"
      }
    ) {
      customerAddress {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.customerAddressUpdate || { customerUserErrors: [{ message: "Unknown error" }] };

  } catch (error) {
    console.log("Shopify update address error:", error);
    return { customerUserErrors: [{ message: error.message }] };
  }
};

export const deleteCustomerAddress = async (customerAccessToken, addressId) => {
  const query = `
  mutation {
    customerAddressDelete(
      customerAccessToken: "${customerAccessToken}",
      id: "${addressId}"
    ) {
      deletedCustomerAddressId
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.customerAddressDelete || { customerUserErrors: [{ message: "Unknown error" }] };

  } catch (error) {
    console.log("Shopify delete address error:", error);
    return { customerUserErrors: [{ message: error.message }] };
  }
};

export const setDefaultAddress = async (customerAccessToken, addressId) => {
  const query = `
  mutation {
    customerDefaultAddressUpdate(
      customerAccessToken: "${customerAccessToken}",
      addressId: "${addressId}"
    ) {
      customer {
        id
      }
      customerUserErrors {
        code
        field
        message
      }
    }
  }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query })
    });

    const json = await response.json();
    return json?.data?.customerDefaultAddressUpdate || { customerUserErrors: [{ message: "Unknown error" }] };

  } catch (error) {
    console.log("Shopify set default address error:", error);
    return { customerUserErrors: [{ message: error.message }] };
  }
};
