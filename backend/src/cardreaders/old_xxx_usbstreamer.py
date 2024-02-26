import usb.core
import usb.backend.libusb1


backend = usb.backend.libusb1.get_backend(find_library=lambda x:"/usr/local/Cellar/libusb/1.0.27/lib/libusb-1.0.dylib")
dev = usb.core.find(find_all=True, backend=backend)
dev_list = list(dev)
actual_dev = dev_list[0]
cfg = actual_dev.get_active_configuration()
actual_dev.is_kernel_driver_active(0)
actual_dev.set_configuration()
endpoint = actual_dev[0][(0,0)][0]
data = actual_dev.read(endpoint.bEndpointAddress, endpoint.wMaxPacketSize)
print("READ DATA: ", data)

""">>> actual_dev
<DEVICE ID ffff:0035 on Bus 020 Address 014>
>>>
>>> actual_dev.iManufacturer
1
>>> actual_dev.product
'USB Reader'
>>>
>>> actual_dev.manufacturer
'USB Reader'
>>>
>>> actual_dev.set_configuration
<bound method Device.set_configuration of <DEVICE ID ffff:0035 on Bus 020 Address 014>>
>>>
>>> actual_dev.get_active_configuration
<bound method Device.get_active_configuration of <DEVICE ID ffff:0035 on Bus 020 Address 014>>
>>>
>>> actual_dev.idVendor
65535
>>>
>>> actual_dev.bLength
18
>>> cfg = actual_dev.get_active_configuration()
>>>
>>> cfg
<CONFIGURATION 1: 200 mA>
>>>
>>> cfg.bLength
9
>>>  actual_dev.bNumConfigurations
  File "<stdin>", line 1
    actual_dev.bNumConfigurations
IndentationError: unexpected indent
>>>
>>> actual_dev.bNumConfigurations
1
>>> cfg.bNumInterfaces
2
>>> cfg.interfaces()
(<INTERFACE 0: Human Interface Device>, <INTERFACE 1: Human Interface Device>)
>>>
>>>
>>> dir( cfg.interfaces()[0])
>>> cfg.interfaces()[0].endpoints
<bound method Interface.endpoints of <INTERFACE 0: Human Interface Device>>
>>>
>>> cfg.interfaces()[0].endpoints()
(<ENDPOINT 0x81: Interrupt IN>,)
>>>
>>>
>>> type(cfg.interfaces()[0].endpoints())
<class 'tuple'>
>>>
>>> print(actual_dev)
>>> actual_dev.is_kernel_driver_active(0)
True
>>>
>>> actual_dev.set_configuration()
>>>
>>> endpoint
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
NameError: name 'endpoint' is not defined
>>>
>>>
>>> endpoint = actual_dev[0][(0,0)][0]
 print(endpoint)
 >>> type(actual_dev)
<class 'usb.core.Device'>
>>>
 data = actual_dev.read(endpoint.bEndpointAddress, endpoint.wMaxPacketSize)
"""
