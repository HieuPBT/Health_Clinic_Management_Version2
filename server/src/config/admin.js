import AdminJS, { ComponentLoader } from 'adminjs'
import AdminJSExpress from '@adminjs/express'
import * as AdminJSMongoose from '@adminjs/mongoose'
import dotenv from 'dotenv'
import { DefaultAuthProvider } from 'adminjs';
dotenv.config();
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Department from '../models/Department.js';
import Employee from '../models/Employee.js';
import Invoice from '../models/Invoice.js';
import Medicine from '../models/Medicine.js';
import MedicineCategory from '../models/MedicineCategory.js';
import Patient from '../models/Patient.js';
import Prescription from '../models/Prescription.js';
import Schedule from '../models/Schedule.js';
import Shift from '../models/Shift.js';

import bcrypt from 'bcryptjs'


AdminJS.registerAdapter({
    Resource: AdminJSMongoose.Resource,
    Database: AdminJSMongoose.Database,
})

const componentLoader = new ComponentLoader();
const Components = {
    Dashboard: componentLoader.add("Dashboard", "./invoiceChart"),
  };

const adminJs = new AdminJS({
    componentLoader,
    dashboard: {
        
      },
    databases: [],
    rootPath: '/admin',
    branding: {
        companyName: 'Loc Hieu Clinic',
        logo: '/logo.png',
    },
    pages: {
        statistics: {
            component: Components.Dashboard,
            handler: async (req, res, context) => {
                console.log('statistics handler received    ')
                res.redirect('/statistics/view')
            },
        }
    },
    resources: [
        {
            resource: User,
            options: {
                properties: {
                    // password: {
                    //     isVisible: {
                    //         list: false, edit: false, filter: false, show: false,
                    //     },
                    // },
                },
                // actions: {
                //   new: {
                //     before: async (request) => {
                //       if(request.payload.password) {
                //         request.payload = {
                //           ...request.payload,
                //           password: await bcrypt.hash(request.payload.password, 10)
                //         }
                //       }
                //       return request
                //     },
                //   },
                // },
            },
        },
        {
            resource: Appointment,
            options: {
                properties: {

                }
            }
        },
        {
            resource: Department
        },
        {
            resource: Employee
        },
        {
            resource: Invoice
        },
        {
            resource: Medicine
        },
        {
            resource: MedicineCategory
        },
        {
            resource: Patient
        },
        {
            resource: Prescription
        },
        {
            resource: Schedule
        },
        {
            resource: Shift
        }
    ],
})

const authenticate = async ({email, password}, ctx) => {
    try {
        const user = await User.findOne({ email, role: 'admin' });
        if (user) {
            const matched = await bcrypt.compare(password, user.password);
            if (matched) {
                return user;
            }
        }
        return null;
    } catch (error) {
        console.error('Error during authentication:', error);
        return null;
    }
};

const authProvider = new DefaultAuthProvider({
    authenticate,
});

const router = AdminJSExpress.buildAuthenticatedRouter(adminJs, {
    cookieName: 'adminjs',
    cookiePassword: process.env.SESSION_SECRET,
    provider: authProvider
}, null, {
    secret: 'test',
    resave: false,
    saveUninitialized: true,
})

export { adminJs, router }
