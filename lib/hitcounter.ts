import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct, ConstructOrder } from 'constructs';

export interface HitCounterProps {
    downstream: lambda.IFunction
}

export class HitCounter extends Construct {
    constructor(scope: Construct, id: string, props: HitCounterProps) {
        super(scope, id)
    }
}