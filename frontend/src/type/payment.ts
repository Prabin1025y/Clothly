export interface GenerateSignatureDto {
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
}

export interface GenerateSignatureResponseType {
    signature: string;
}

export interface FormDataType {
    amount: string;
    tax_amount: string;
    total_amount: string;
    transaction_uuid: string;
    product_service_charge: string;
    product_delivery_charge: string;
    product_code: string;
    success_url: string;
    failure_url: string;
    signed_field_names: string;
    signature: string;
}

export interface SuccessfulPaymentDataType {
    transaction_code: string;
    status: string;
    total_amount: string;
    transaction_uuid: string;
    product_code: string;
    signed_field_names: string;
    signature: string;
}
