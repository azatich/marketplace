export interface SignupRequest {
    email: string
    password: string
    firstName: string
    lastName: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface SellerFormData {
    email: string
    password: string
    storeName: string
    description: string
    category: string
    sellerFirstName: string
    sellerLastName: string
    phone: string
}